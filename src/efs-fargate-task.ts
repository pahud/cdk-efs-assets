import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as efs from '@aws-cdk/aws-efs';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as cdk from '@aws-cdk/core';
import { GithubSecret } from './synced-access-point';

export interface EfsFargateTaskProps {
  readonly accessPoint: efs.AccessPoint;
  readonly secret?: GithubSecret;
  readonly syncContainer: ecs.ContainerDefinitionOptions;
  readonly vpc: ec2.IVpc;
  /**
   * EFS mount target in the container
   *
   * @default /mnt/efsmount
   */
  readonly efsMountTarget?: string;
}

/**
 * Represents the AWS Fargate task with EFS and secret manager support
 */
export class EfsFargateTask extends cdk.Construct {
  readonly task: ecs.FargateTaskDefinition;
  readonly securityGroup: ec2.SecurityGroup;
  constructor(scope: cdk.Construct, id: string, props: EfsFargateTaskProps) {
    super(scope, id);

    const stack = cdk.Stack.of(scope);

    const task = new ecs.FargateTaskDefinition(stack, `TaskDefinition${id}`, {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    this.task = task;

    task.addVolume({
      name: 'efs-data',
      efsVolumeConfiguration: {
        fileSystemId: props.accessPoint.fileSystem.fileSystemId,
      },
    });

    let secret: secretsmanager.ISecret | undefined;

    if (props.secret?.id) {
      // format the arn e.g. 'arn:aws:secretsmanager:eu-west-1:111111111111:secret:MySecret';
      const secretPartialArn = stack.formatArn({
        service: 'secretsmanager',
        resource: 'secret',
        resourceName: props.secret?.id,
        sep: ':',
      });
      secret = secretsmanager.Secret.fromSecretAttributes(stack, 'GithubSecret', {
        secretPartialArn,
      });
      // allow task to read the secret
      secret.grantRead(task.taskRole);
    }

    const logGroup = new LogGroup(stack, `LogGroup${id}`, {
      retention: RetentionDays.ONE_DAY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new cdk.CfnOutput(stack, `LogGroup${id}Output`, { value: logGroup.logGroupName });

    const syncWorker = task.addContainer('SyncWorker', {
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'SyncWorker',
        logGroup,
      }),
      ...props.syncContainer,
    });

    syncWorker.addMountPoints({
      containerPath: props.efsMountTarget ?? '/mnt/efsmount',
      sourceVolume: 'efs-data',
      readOnly: false,
    });

    task.addToExecutionRolePolicy(new PolicyStatement({
      actions: [
        'elasticfilesystem:ClientMount',
        'elasticfilesystem:ClientWrite',
      ],
      resources: [
        stack.formatArn({
          service: 'elasticfilesystem',
          resource: 'file-system',
          sep: '/',
          resourceName: props.accessPoint.fileSystem.fileSystemId,
        }),
      ],
    }));

    // create a default security group for the fargate task
    this.securityGroup = new ec2.SecurityGroup(stack, `FargateSecurityGroup${id}`, { vpc: props.vpc });

    // allow fargate ingress to the efs filesystem
    props.accessPoint.fileSystem.connections.allowFrom(this.securityGroup, ec2.Port.tcp(2049));

  }
}
