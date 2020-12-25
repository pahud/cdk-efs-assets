import * as ec2 from '@aws-cdk/aws-ec2';
import * as efs from '@aws-cdk/aws-efs';
import { Bucket } from '@aws-cdk/aws-s3';
import { App, Stack, RemovalPolicy } from '@aws-cdk/core';
import { GithubSourceSync } from './github-source-sync';
import { S3ArchiveSync } from './s3-archive-sync';

const AWS_DEFAULT_REGION = 'us-east-1';

export class IntegTesting {
  readonly stack: Stack[];

  constructor() {
    const app = new App();

    const env = {
      region: process.env.CDK_DEFAULT_REGION ?? AWS_DEFAULT_REGION,
      account: process.env.CDK_DEFAULT_ACCOUNT ?? '11111111111',
    };

    const stack = new Stack(app, 'testing-stack9', { env });

    const vpc = ec2.Vpc.fromLookup(stack, 'Vpc', { isDefault: true });

    const fs = new efs.FileSystem(stack, 'Filesystem', {
      vpc,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const bucket = new Bucket(stack, 'Bucket', {
      bucketName: 'a-bucket',
    });

    const efsAccessPoint = fs.addAccessPoint('EfsAccessPoint', {
      path: '/demo',
      createAcl: {
        ownerGid: '1001',
        ownerUid: '1001',
        permissions: '0755',
      },
      posixUser: {
        uid: '1001',
        gid: '1001',
      },
    });

    // create the one-time sync from Github repository to Amaozn EFS
    new GithubSourceSync(stack, 'GithubSourceSync', {
      repository: 'https://github.com/pahud/cdk-efs-assets.git',
      efsAccessPoint,
      runsAfter: [fs.mountTargetsAvailable],
      vpc,
    });

    // create the recurring sync from S3 Archive to Amazon EFS
    new S3ArchiveSync(stack, 'S3ArchiveSync', {
      bucket: bucket,
      zipFilePath: 'folder/foo.zip',
      efsAccessPoint,
      runsAfter: [fs.mountTargetsAvailable],
      vpc,
      shouldMonitorS3Path: true,
    });

    this.stack = [stack];
  }
}

// run the integ testing
new IntegTesting();
