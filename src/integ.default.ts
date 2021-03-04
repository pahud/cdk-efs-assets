import * as ec2 from '@aws-cdk/aws-ec2';
import * as efs from '@aws-cdk/aws-efs';
import { Bucket } from '@aws-cdk/aws-s3';
import { App, Stack, RemovalPolicy, Construct } from '@aws-cdk/core';
import { SyncedAccessPoint, GithubSyncSource, S3ArchiveSyncSource } from './synced-access-point';

export class IntegTesting {
  readonly stack: Stack[];

  constructor() {
    const app = new App();

    const env = {
      region: process.env.CDK_DEFAULT_REGION,
      account: process.env.CDK_DEFAULT_ACCOUNT,
    };

    const stack = new Stack(app, 'testing-stack', { env });

    const vpc = getOrCreateVpc(stack);

    const fs = new efs.FileSystem(stack, 'Filesystem', {
      vpc,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const bucketName = stack.node.tryGetContext('BUCKET_NAME') || 'mock';
    const bucket = Bucket.fromBucketName(stack, 'ImportedBucket', bucketName);

    // checkout the public github repo to efs filesystem
    new SyncedAccessPoint(stack, 'GithubSyncedAccessPoint', {
      vpc,
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
      syncSource: new GithubSyncSource({
        vpc,
        repository: 'https://github.com/pahud/cdk-efs-assets.git',
      }),
    });

    // checkout the private github repo to efs filesystem
    new SyncedAccessPoint(stack, 'GithubSyncedAccessPointPrivate', {
      vpc,
      fileSystem: fs,
      path: '/demo-github-private',
      createAcl: {
        ownerGid: '1001',
        ownerUid: '1001',
        permissions: '0755',
      },
      posixUser: {
        uid: '1001',
        gid: '1001',
      },
      syncSource: new GithubSyncSource({
        vpc,
        repository: 'https://github.com/pahud/private-repo.git',
        secret: {
          id: 'github',
          key: 'oauth_token',
        },
      }),
    });

    new SyncedAccessPoint(stack, 'S3SyncedAccessPoint', {
      vpc,
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
      syncSource: new S3ArchiveSyncSource({
        vpc,
        bucket,
        zipFilePath: 'folder/foo.zip',
      }),
    });

    this.stack = [stack];
  }
}

// run the integ testing
new IntegTesting();


function getOrCreateVpc(scope: Construct): ec2.IVpc {
  // use an existing vpc or create a new one
  return scope.node.tryGetContext('use_default_vpc') === '1' ?
    ec2.Vpc.fromLookup(scope, 'Vpc', { isDefault: true }) :
    scope.node.tryGetContext('use_vpc_id') ?
      ec2.Vpc.fromLookup(scope, 'Vpc', { vpcId: scope.node.tryGetContext('use_vpc_id') }) :
      new ec2.Vpc(scope, 'Vpc', { maxAzs: 3, natGateways: 1 });
}
