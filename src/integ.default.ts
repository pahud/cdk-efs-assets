import * as ec2 from '@aws-cdk/aws-ec2';
import * as efs from '@aws-cdk/aws-efs';
import { Bucket } from '@aws-cdk/aws-s3';
import { App, Stack, RemovalPolicy } from '@aws-cdk/core';
import { SyncedAccessPoint, SyncSource } from './synced-access-point';

const AWS_DEFAULT_REGION = 'us-east-1';

export class IntegTesting {
  readonly stack: Stack[];

  constructor() {
    const app = new App();

    const env = {
      region: process.env.CDK_DEFAULT_REGION ?? AWS_DEFAULT_REGION,
      account: process.env.CDK_DEFAULT_ACCOUNT ?? '11111111111',
    };

    const stack = new Stack(app, 'testing-stack', { env });

    const vpc = ec2.Vpc.fromLookup(stack, 'Vpc', { isDefault: true });

    const fs = new efs.FileSystem(stack, 'Filesystem', {
      vpc,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const bucket = new Bucket(stack, 'Bucket', {
      bucketName: 'a-bucket',
    });

    // checkout the public github repo to efs filesystem
    new SyncedAccessPoint(stack, 'GithubSyncedAccessPoint', {
      fileSystem: fs,
      path: '/demo-github',
      createAcl: {
        ownerGid: '1001',
        ownerUid: '1001',
        permissions: '0755',
      },
      posixUser: {
        uid: '1001',
        gid: '1001',
      },
      syncSource: SyncSource.github({
        vpc: vpc,
        repository: 'https://github.com/pahud/cdk-efs-assets.git',
      }),
    });

    // checkout the private github repo to efs filesystem
    new SyncedAccessPoint(stack, 'GithubSyncedAccessPointPrivate', {
      fileSystem: fs,
      path: '/demo-github',
      createAcl: {
        ownerGid: '1001',
        ownerUid: '1001',
        permissions: '0755',
      },
      posixUser: {
        uid: '1001',
        gid: '1001',
      },
      syncSource: SyncSource.github({
        vpc: vpc,
        repository: 'https://github.com/pahud/private-repo.git',
        secret: {
          id: 'github',
          key: 'oauth_token',
        },
      }),
    });

    new SyncedAccessPoint(stack, 'S3SyncedAccessPoint', {
      fileSystem: fs,
      path: '/demo-s3-archive',
      createAcl: {
        ownerGid: '1001',
        ownerUid: '1001',
        permissions: '0755',
      },
      posixUser: {
        uid: '1001',
        gid: '1001',
      },
      syncSource: SyncSource.s3Archive({
        vpc: vpc,
        bucket: bucket,
        zipFilePath: 'folder/foo.zip',
      }),
    });

    this.stack = [stack];
  }
}

// run the integ testing
new IntegTesting();
