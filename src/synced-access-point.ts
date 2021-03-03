import * as path from 'path';
import { URL } from 'url';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as efs from '@aws-cdk/aws-efs';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as cdk from '@aws-cdk/core';
// import * as cr from '@aws-cdk/custom-resources';
import { RunTask } from 'cdk-fargate-run-task';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
// import { Runtime } from '@aws-cdk/aws-lambda';


export interface SyncSourceProps {
  /**
   * The VPC of the Amazon EFS Filesystem.
   */
  readonly vpc: ec2.IVpc;
  /**
   * Where to place the network interfaces within the VPC.
   */
  readonly vpcSubnets?: ec2.SubnetSelection;
  /**
   * Timeout duration for sync Lambda function. (optional, default: Duration.minutes(3))
   */
  readonly timeout?: cdk.Duration;
  /**
   * The (absolute) directory path inside the EFS AccessPoint to sync files to. Specify '/' to restore synced files to the root
   * directory. (optional, default: a source-specific directory path. For example, for the GitHub source, the default
   * behavior is to restore to a directory matching the name of the repository)
   */
  readonly syncDirectoryPath?: string;
}

export interface GithubSecret {
  /**
   * The secret ID from AWS Secrets Manager
   */
  readonly id: string;
  /**
   * The key of the secret
   */
  readonly key: string;
}

export interface GithubSourceProps extends SyncSourceProps {
  /**
   * The github repository HTTP URI.
   */
  readonly repository: string;
  /**
   * The github secret for the private repository
   */
  readonly secret?: GithubSecret;
}

export interface S3ArchiveSourceProps extends SyncSourceProps {
  /**
   * The S3 bucket containing the archive file.
   */
  readonly bucket: s3.IBucket;

  /**
   * The path of the zip file to extract in the S3 bucket.
   */
  readonly zipFilePath: string;

  /**
   * If this is set to true, then whenever a new object is uploaded to the specified path, an EFS sync will be triggered.
   * Currently, this functionality depends on at least one CloudTrail Trail existing in your account that captures the S3
   * event.
   *
   * (optional, default: true)
   */
  readonly syncOnUpdate?: boolean;
}

export abstract class SyncSource {
  public static github(props: GithubSourceProps): SyncSource {
    return new GithubSyncSource(props);
  }

  public static s3Archive(props: S3ArchiveSourceProps): SyncSource {
    return new S3ArchiveSyncSource(props);
  }

  /** @internal */
  abstract _createHandler(accessPoint: efs.AccessPoint): lambda.Function;

  /** @internal */
  abstract _createFargateTask(id: string, accessPoint: efs.AccessPoint): ecs.TaskDefinition;
}

class GithubSyncSource extends SyncSource {
  private readonly props: GithubSourceProps;

  constructor(props: GithubSourceProps) {
    super();
    this.props = props;
  }

  _createHandler(accessPoint: efs.AccessPoint): lambda.Function {
    const stack = cdk.Stack.of(accessPoint);
    const region = stack.region;

    const vpcSubnets = this.props.vpcSubnets ?? { subnetType: ec2.SubnetType.PRIVATE };
    const timeout = this.props.timeout ?? cdk.Duration.minutes(3);

    let syncDirectoryPath;
    if (this.props.syncDirectoryPath === undefined) {
      // if property is unspecified, use repository name as output directory

      const parsed = new URL(this.props.repository);
      syncDirectoryPath = '/' + path.basename(parsed.pathname, '.git');
    } else {
      syncDirectoryPath = this.props.syncDirectoryPath;
    }

    const lambdaEnv: { [key: string]: string } = {
      REPOSITORY_URI: this.props.repository,
      MOUNT_TARGET: '/mnt/efsmount',
      SYNC_PATH: syncDirectoryPath,
    };

    if (this.props.secret) {
      lambdaEnv.GITHUB_SECRET_ID = this.props.secret.id;
      lambdaEnv.GITHUB_SECRET_KEY = this.props.secret.key;
    }

    const handler = new lambda.Function(accessPoint, 'GithubHandler', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-handler', 'github-sync')),
      handler: 'index.on_event',
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(
          accessPoint,
          'GitLayer',
          `arn:aws:lambda:${region}:553035198032:layer:git-lambda2:7`,
        ),
      ],
      filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint, '/mnt/efsmount'),
      vpcSubnets: vpcSubnets,
      vpc: this.props.vpc,
      memorySize: 512,
      timeout: timeout,
      environment: lambdaEnv,
      currentVersionOptions: {
        provisionedConcurrentExecutions: 1,
      },
    });

    if (this.props.secret?.id) {
      // format the arn e.g. 'arn:aws:secretsmanager:eu-west-1:111111111111:secret:MySecret';
      const secretPartialArn = stack.formatArn({
        service: 'secretsmanager',
        resource: 'secret',
        resourceName: this.props.secret?.id,
        sep: ':',
      });
      const secret = secretsmanager.Secret.fromSecretAttributes(stack, 'GithubSecret', {
        secretPartialArn,
      });
      // allow lambda to read the secret
      secret.grantRead(handler);
    }

    return handler;
  }

  _createFargateTask(id: string, accessPoint: efs.AccessPoint): ecs.TaskDefinition {
    const stack = cdk.Stack.of(accessPoint);
    // const region = stack.region;

    // const vpcSubnets = this.props.vpcSubnets ?? { subnetType: ec2.SubnetType.PRIVATE };
    // const timeout = this.props.timeout ?? cdk.Duration.minutes(3);
    const task = new ecs.FargateTaskDefinition(stack, id, { 
      cpu: 256,
      memoryLimitMiB: 512,
    });

    const mountTarget = '/mnt/efsmount';

    let syncDirectoryPath;
    if (this.props.syncDirectoryPath === undefined) {
      // if property is unspecified, use repository name as output directory

      const parsed = new URL(this.props.repository);
      syncDirectoryPath = '/' + path.basename(parsed.pathname, '.git');
    } else {
      syncDirectoryPath = this.props.syncDirectoryPath;
    }

    const environment: { [key: string]: string } = {
      REPOSITORY_URI: this.props.repository,
      MOUNT_TARGET: mountTarget,
      SYNC_PATH: syncDirectoryPath,
    }

    if (this.props.secret) {
      environment.GITHUB_SECRET_ID = this.props.secret.id;
      environment.GITHUB_SECRET_KEY = this.props.secret.key;
    }

    task.addVolume({
      name: 'efs-data',
      efsVolumeConfiguration: {
        fileSystemId: accessPoint.fileSystem.fileSystemId,
      },
    });

    const syncWorker = task.addContainer('SyncWorker', {
      // image: ecs.ContainerImage.fromRegistry('public.ecr.aws/amazonlinux/amazonlinux:2'),
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../docker.d')),
      command: [
        'sh', '-c',
        'git clone ${REPOSITORY_URI} ${MOUNT_TARGET}${SYNC_PATH}',
      ],
      environment,
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'SyncWorker',
        logGroup: new LogGroup(stack, `LogGroup${id}`, {
          retention: RetentionDays.ONE_DAY,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      }),
    });

    syncWorker.addMountPoints({
      containerPath: mountTarget,
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
          resourceName: accessPoint.fileSystem.fileSystemId,
        }),
      ],
    }));

    if (this.props.secret?.id) {
      // format the arn e.g. 'arn:aws:secretsmanager:eu-west-1:111111111111:secret:MySecret';
      const secretPartialArn = stack.formatArn({
        service: 'secretsmanager',
        resource: 'secret',
        resourceName: this.props.secret?.id,
        sep: ':',
      });
      const secret = secretsmanager.Secret.fromSecretAttributes(stack, 'GithubSecret', {
        secretPartialArn,
      });
      // allow task to read the secret
      secret.grantRead(task.executionRole!);
    }

    return task;
  };
}

class S3ArchiveSyncSource extends SyncSource {
  private readonly props: S3ArchiveSourceProps;

  constructor(props: S3ArchiveSourceProps) {
    super();
    this.props = props;
  }

  _createHandler(accessPoint: efs.AccessPoint): lambda.Function {
    const vpcSubnets = this.props.vpcSubnets ?? { subnetType: ec2.SubnetType.PRIVATE };
    const syncOnUpdate = this.props.syncOnUpdate ?? true;
    const timeout = this.props.timeout ?? cdk.Duration.minutes(3);

    const filename = path.basename(this.props.zipFilePath, '.zip');

    let syncDirectoryPath;
    if (this.props.syncDirectoryPath === undefined) {
      // if property is unspecified, use zip file name as output directory

      syncDirectoryPath = '/' + filename;
    } else {
      syncDirectoryPath = this.props.syncDirectoryPath;
    }

    const handler = new lambda.Function(accessPoint, 'SyncHandler', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-handler', 's3-archive-sync')),
      handler: 'index.on_event',
      filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint, '/mnt/efsmount'),
      vpcSubnets: vpcSubnets,
      vpc: this.props.vpc,
      memorySize: 512,
      timeout: timeout,
      environment: {
        MOUNT_TARGET: '/mnt/efsmount',
        BUCKET_NAME: this.props.bucket.bucketName,
        ZIPPED_KEY: this.props.zipFilePath,
        SYNC_PATH: syncDirectoryPath,
      },
      currentVersionOptions: {
        provisionedConcurrentExecutions: 1,
      },
      initialPolicy: [
        new PolicyStatement({
          actions: ['s3:GetObject*'],
          resources: ['arn:aws:s3:::' + this.props.bucket.bucketName + '/' + this.props.zipFilePath],
        }),
      ],
    });

    if (syncOnUpdate) {
      // In order to support bucket notifications for imported IBucket objects, onCloudTrailWriteObject is used.
      // TODO: When https://github.com/aws/aws-cdk/issues/2004 is closed, can use handler.addEventSource instead.
      /*
      handler.addEventSource(
        new S3EventSource(props.bucket, {
          events: [s3.EventType.OBJECT_CREATED],
          filters: [{ prefix: props.zipFilePath }]
        })
      );
       */

      this.props.bucket.onCloudTrailWriteObject('S3FileListener-' + filename, {
        paths: [this.props.zipFilePath],
        target: new LambdaFunction(handler),
      });
    }

    return handler;
  }

  _createFargateTask(id: string, accessPoint: efs.AccessPoint): ecs.TaskDefinition {
    const stack = cdk.Stack.of(accessPoint);
    // const region = stack.region;

    // const vpcSubnets = this.props.vpcSubnets ?? { subnetType: ec2.SubnetType.PRIVATE };
    // const timeout = this.props.timeout ?? cdk.Duration.minutes(3);
    const task = new ecs.FargateTaskDefinition(stack, id, { cpu: 256, memoryLimitMiB: 512 });

    // let syncDirectoryPath;
    // if (this.props.syncDirectoryPath === undefined) {
    //   // if property is unspecified, use repository name as output directory

    //   const parsed = new URL(this.props.repository);
    //   syncDirectoryPath = '/' + path.basename(parsed.pathname, '.git');
    // } else {
    //   syncDirectoryPath = this.props.syncDirectoryPath;
    // }

    // const environment: { [key: string]: string } = {
    //   REPOSITORY_URI: this.props.repository,
    //   MOUNT_TARGET: '/mnt/efsmount',
    //   SYNC_PATH: syncDirectoryPath,
    // }

    // if (this.props.secret) {
    //   environment.GITHUB_SECRET_ID = this.props.secret.id;
    //   environment.GITHUB_SECRET_KEY = this.props.secret.key;
    // }

    // task.addContainer('SyncWorker', {
    //   // image: ecs.ContainerImage.fromRegistry('public.ecr.aws/amazonlinux/amazonlinux:2'),
    //   image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../docker.d')),
    //   command: [
    //     'sh', '-c',
    //     'git clone ${REPOSITORY_URI} ${MOUNT_TARGET}${SYNC_PATH}',
    //   ],
    //   environment,
    //   logging: new ecs.AwsLogDriver({
    //     streamPrefix: 'Ping',
    //     logGroup: new LogGroup(stack, 'LogGroup', {
    //       retention: RetentionDays.ONE_DAY,
    //       removalPolicy: cdk.RemovalPolicy.DESTROY,
    //     }),
    //   }),
    // });

    // if (this.props.secret?.id) {
    //   // format the arn e.g. 'arn:aws:secretsmanager:eu-west-1:111111111111:secret:MySecret';
    //   const secretPartialArn = stack.formatArn({
    //     service: 'secretsmanager',
    //     resource: 'secret',
    //     resourceName: this.props.secret?.id,
    //     sep: ':',
    //   });
    //   const secret = secretsmanager.Secret.fromSecretAttributes(stack, 'GithubSecret', {
    //     secretPartialArn,
    //   });
    //   // allow task to read the secret
    //   secret.grantRead(task.executionRole);
    // }

    return task;
  };
}

export interface SyncedAccessPointProps extends efs.AccessPointProps {
  readonly syncSource: SyncSource;
  /**
   * The VPC to run the sync job
   */
  readonly vpc: ec2.IVpc;
}

export class SyncedAccessPoint extends efs.AccessPoint implements efs.IAccessPoint {
  constructor(scope: cdk.Construct, id: string, props: SyncedAccessPointProps) {
    super(scope, id, props);

    // const handler = props.syncSource._createHandler(this);

    // // create a custom resource to trigger the sync
    // const myProvider = new cr.Provider(this, 'Provider', {
    //   onEventHandler: handler,
    // });

    const task = props.syncSource._createFargateTask(`${id}Task`, this );

    const cluster = new ecs.Cluster(this, 'Cluster', { vpc: props.vpc  });

    const runTask = new RunTask(this, 'SyncTrigger', {
      task,
      // vpc: props.vpc,
      cluster,
    })

    runTask.node.addDependency(props.fileSystem.mountTargetsAvailable);

    // new cdk.CustomResource(this, 'SyncTrigger', { serviceToken: myProvider.serviceToken });

    // ensure the mount targets are available as dependency for the sync function
    // handler.node.addDependency(props.fileSystem.mountTargetsAvailable);
  }
}
