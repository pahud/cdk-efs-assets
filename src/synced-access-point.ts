import * as path from 'path';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as efs from '@aws-cdk/aws-efs';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';

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
}

export interface GithubSourceProps extends SyncSourceProps {
  /**
   * The github repository HTTP URI.
   */
  readonly repository: string;
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
      environment: {
        REPOSITORY_URI: this.props.repository,
        MOUNT_TARGET: '/mnt/efsmount',
      },
      currentVersionOptions: {
        provisionedConcurrentExecutions: 1,
      },
    });

    return handler;
  }
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

      this.props.bucket.onCloudTrailWriteObject('S3ObjectListener', {
        paths: [this.props.zipFilePath],
        target: new LambdaFunction(handler),
      });
    }

    return handler;
  }
}

export interface SyncedAccessPointProps extends efs.AccessPointProps {
  readonly syncSource: SyncSource;
}

export class SyncedAccessPoint extends efs.AccessPoint implements efs.IAccessPoint {
  constructor(scope: cdk.Construct, id: string, props: SyncedAccessPointProps) {
    super(scope, id, props);

    const handler = props.syncSource._createHandler(this);

    // create a custom resource to trigger the sync
    const myProvider = new cr.Provider(this, 'Provider', {
      onEventHandler: handler,
    });

    new cdk.CustomResource(this, 'SyncTrigger', { serviceToken: myProvider.serviceToken });

    // ensure the mount targets are available as dependency for the sync function
    handler.node.addDependency(props.fileSystem.mountTargetsAvailable);
  }
}
