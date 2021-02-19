[![NPM version](https://badge.fury.io/js/cdk-efs-assets.svg)](https://badge.fury.io/js/cdk-efs-assets)
[![PyPI version](https://badge.fury.io/py/cdk-efs-assets.svg)](https://badge.fury.io/py/cdk-efs-assets)
![Release](https://github.com/pahud/cdk-efs-assets/workflows/Release/badge.svg)

# cdk-efs-assets

CDK construct library to populate Amazon EFS assets from Github or S3. If the source is S3, the construct also optionally supports updating the contents in EFS if a new zip file is uploaded to S3.

## Install
TypeScript/JavaScript:

```bash
npm i cdk-efs-assets
```

## SyncedAccessPoint

The main construct that is used to provide this EFS sync functionality is `SyncedAccessPoint`. This extends the standard EFS `AccessPoint` construct, and takes an additional `SyncSource` constructor property which defines the source to sync assets from. The `SyncedAccessPoint` instance can be used anywhere an `AccessPoint` can be used. For example, to specify a volume in a Task Definition:

```ts
const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
  ... 
  volumes: [
    {
      name: 'efs-storage',
      efsVolumeConfiguration: {
        fileSystemId: sharedFileSystem.fileSystemId,
        transitEncryption: 'ENABLED',
        authorizationConfig: {
          accessPointId: syncedAccessPoint.accessPointId
        }
      }
    },
  ]
});
```

## SyncSource

Use the `SyncSource` static functions to create a `SyncSource` instance that can then be passed as a `SyncedAccessPoint` constructor property to define the source of the sync. For example:

```ts
new SyncedAccessPoint(stack, 'EfsAccessPoint', {
  ...
  syncSource: SyncSource.github({
    vpc,
    repository: 'https://github.com/pahud/cdk-efs-assets.git',
  })
});
```

### syncDirectoryPath

By default, the synced EFS assets are placed into a directory corresponding to the type of the sync source. For example, the default behavior of the GitHub source is to place the copied files into a directory named the same as the repository name (for a repository specified as 'https://github.com/pahud/cdk-efs-assets.git', the directory name would be 'cdk-efs-assets'), while the default behavior of the S3 archive source is to place the copied files into a directory named the same as the zip file (for a zip file name of 'assets.zip', the directory name would be 'assets').

If you wish to override this default behavior, specify a value for the `syncDirectoryPath` property that is passed into the `SyncSource` call.

If you are using the `AccessPoint` in an ECS/Fargate Task Definition, you probably will want to override the value of `syncDirectoryPath` to '/'. This will place the file contents in the root directory of the Access Point. The reason for this is that when you create a volume that is referencing an EFS Access Point, you are not allowed to specify any path other than the root directory in the task definition configuration.

## How to use SyncedAccessPoint initialized with files provisioned from GitHub repository

This will sync assets from a GitHub repository to a directory (by default, the output directory is named after the repository name) in the EFS AccessPoint:

```ts
import { SyncSource, SyncedAccessPoint } from 'cdk-efs-assets';

const app = new App();

const env = {
  region: process.env.CDK_DEFAULT_REGION ?? AWS_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const stack = new Stack(app, 'testing-stack', { env });

const vpc = ec2.Vpc.fromLookup(stack, 'Vpc', { isDefault: true })

const fs = new efs.FileSystem(stack, 'Filesystem', {
  vpc,
  removalPolicy: RemovalPolicy.DESTROY,
})

const efsAccessPoint = new SyncedAccessPoint(stack, 'GithubAccessPoint', {
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
    vpc,
    repository: 'https://github.com/pahud/cdk-efs-assets.git',
  })
});
```

### Github private repository support

To clone a github private repository, you need to generate your github **PAT(Personal Access Token)** and store the token in **AWS Secrets Manager** secret.

For example, if your PAT is stored in the AWS Secret manager with the secret ID `github` and the key `oauth_token`, you can specify the `secret` property as the sample below. Under the covers the lambda function will format the full github repository uri with your **PAT** and successfully git clone the private repository to the efs filesystem.

Store your PAT into the AWS Secrets Manager with AWS CLI:

```sh
aws secretsmanager create-secret \
--name github \
--secret-string '{"oauth_token":"MYOAUTHTOKEN"}'
```

Configure the `secret` property to allow lambda to retrieve the **PAT** from the secret:


```ts
SyncSource.github({
    vpc,
    repository: 'https://github.com/username/repo.git',
    secret: {
      id: 'github',
      key: 'oauth_token',
    },
})
```

## How to use SyncedAccessPoint initialized with files provisioned from zip file stored in S3

This will sync assets from a zip file stored in an S3 bucket to a directory (by default, the output directory is named after the zip file name) in the EFS AccessPoint:

```ts
import { S3ArchiveSync } from 'cdk-efs-assets';

const app = new App();

const env = {
  region: process.env.CDK_DEFAULT_REGION ?? AWS_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const stack = new Stack(app, 'testing-stack', { env });

const vpc = ec2.Vpc.fromLookup(stack, 'Vpc', { isDefault: true })

const fs = new efs.FileSystem(stack, 'Filesystem', {
  vpc,
  removalPolicy: RemovalPolicy.DESTROY,
})

const bucket = Bucket.fromBucketName(this, 'Bucket', 'demo-bucket');

const efsAccessPoint = new SyncedAccessPoint(stack, 'EfsAccessPoint', {
  fileSystem: fs,
  path: '/demo-s3',
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
```

### syncOnUpdate

If the `syncOnUpdate` property is set to `true` (defaults to `true`), then the specified zip file path will be monitored, and if a new object is uploaded to the path, then it will resync the data to EFS. Note that to use this functionality, you must have a CloudTrail Trail in your account that captures the desired S3 write data event.

*WARNING*: The contents of the extraction directory in the access point will be destroyed before extracting the zip file.

