# cdk-efs-assets

CDK construct library to populate Amazon EFS assets from Github or S3.

# `GithubSourceSync`

The `GithubSourceSync` deploys your Amazon EFS assets from specified Github repository. 

## Sample

```ts
import { GithubSourceSync } from 'cdk-efs-assets';

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
  }
});

// create the one-time sync from Github repository to Amaozn EFS
new GithubSourceSync(stack, 'GithubSourceSync', {
  repository: 'https://github.com/pahud/cdk-efs-assets.git',
  efsAccessPoint,
  runsAfter: [fs.mountTargetsAvailable],
  vpc,
});

```

# `S3ArchiveSync`

The `S3ArchiveSync` deploys your Amazon EFS assets from a specified zip archive file stored in S3. The extracted contents will be placed into the root directory of the access point.

If the `syncOnUpdate` property is set to `true` (defaults to `true`), then the specified zip file path will be monitored, and if a new object is uploaded to the path, then it will resync the data to EFS. Note that to use this functionality, you must have a CloudTrail Trail in your account that captures the desired S3 write data event.

*WARNING*: The contents of the access point will be removed before extracting the zip file.

## Sample

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
  }
});

const bucket = Bucket.fromBucketName(this, 'Bucket', 'demo-bucket');

// Will sync initial data from compressed S3 archive to EFS, and resync if the zip file in S3 changes
new S3ArchiveSync(this, 'S3ArchiveSync', {
  bucket,
  zipFilePath: 'folder/foo.zip',
  vpc,
  efsAccessPoint,
  runsAfter: [fs.mountTargetsAvailable],
});
```

# `S3SourceSync`

TBD


