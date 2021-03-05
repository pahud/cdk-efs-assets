import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as patterns from '@aws-cdk/aws-ecs-patterns';
import * as efs from '@aws-cdk/aws-efs';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';


export interface EfsFargateSiteProps {
  readonly vpc: ec2.IVpc;
  readonly task: ecs.FargateTaskDefinition;
  readonly accessPoint: efs.AccessPoint;
}

export class EfsFargateSite extends cdk.Construct {
  readonly task: ecs.FargateTaskDefinition;
  readonly service: patterns.ApplicationLoadBalancedFargateService;
  constructor(scope: cdk.Construct, id: string, props: EfsFargateSiteProps) {
    super(scope, id);

    this.task = props.task;

    this.task.addVolume({
      name: 'efs-storage',
      efsVolumeConfiguration: {
        fileSystemId: props.accessPoint.fileSystem.fileSystemId,
        authorizationConfig: {
          accessPointId: props.accessPoint.accessPointId,
          // iam: 'ENABLED',
        },
        transitEncryption: 'ENABLED',
        // rootDirectory: '/demo-github',
      },
    });

    this.service = new patterns.ApplicationLoadBalancedFargateService(this, 'FargateService', {
      vpc: props.vpc,
      taskDefinition: this.task,
      platformVersion: ecs.FargatePlatformVersion.VERSION1_4,
    });

    // this.service.node.addDependency(props.accessPoint.fileSystem.mountTargetsAvailable)

    this.task.addToExecutionRolePolicy(new PolicyStatement({
      actions: [
        'elasticfilesystem:ClientMount',
        'elasticfilesystem:ClientWrite',
      ],
      resources: [
        cdk.Stack.of(this).formatArn({
          service: 'elasticfilesystem',
          resource: 'file-system',
          sep: '/',
          resourceName: props.accessPoint.fileSystem.fileSystemId,
        }),
      ],
    }));

    // allow fargate ingress to the efs filesystem
    props.accessPoint.fileSystem.connections.allowFrom(this.service.service, ec2.Port.tcp(2049));
  }
}
