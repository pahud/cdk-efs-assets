import * as path from 'path';
import * as ec2 from '@aws-cdk/aws-ec2';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';
import { CommonEfsAssetsProps } from './common-props';

export interface S3ArchiveFeederProps extends CommonEfsAssetsProps {
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

export class S3ArchiveSync extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: S3ArchiveFeederProps) {
    super(scope, id);

    const vpcSubnets = props.vpcSubnets ?? { subnetType: ec2.SubnetType.PRIVATE };
    const syncOnUpdate = props.syncOnUpdate ?? true;

    const handler = new lambda.Function(this, 'Handler', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-handler', 's3-archive-sync')),
      handler: 'index.on_event',
      filesystem: lambda.FileSystem.fromEfsAccessPoint(props.efsAccessPoint, '/mnt/efsmount'),
      vpcSubnets: vpcSubnets,
      vpc: props.vpc,
      memorySize: 512,
      timeout: cdk.Duration.minutes(3),
      environment: {
        MOUNT_TARGET: '/mnt/efsmount',
        BUCKET_NAME: props.bucket.bucketName,
        ZIPPED_KEY: props.zipFilePath,
      },
      currentVersionOptions: {
        provisionedConcurrentExecutions: 1,
      },
      initialPolicy: [
        new PolicyStatement({
          actions: ['s3:GetObject*'],
          resources: ['arn:aws:s3:::' + props.bucket.bucketName + '/*'],
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

      props.bucket.onCloudTrailWriteObject('WriteObjectListener', {
        paths: [props.zipFilePath],
        target: new LambdaFunction(handler),
      });
    }

    // create a custom resource to trigger the sync
    const myProvider = new cr.Provider(this, 'MyProvider', {
      onEventHandler: handler,
    });

    new cdk.CustomResource(this, 'SyncTrigger', { serviceToken: myProvider.serviceToken });

    // ensure the dependency
    if (props.runsAfter) {
      handler.node.addDependency(...props.runsAfter);
    }
  }
}
