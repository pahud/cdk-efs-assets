# API Reference

**Classes**

Name|Description
----|-----------
[EfsFargateSite](#cdk-efs-assets-efsfargatesite)|*No description*
[EfsFargateTask](#cdk-efs-assets-efsfargatetask)|Represents the AWS Fargate task with EFS and secret manager support.
[GithubSyncSource](#cdk-efs-assets-githubsyncsource)|*No description*
[S3ArchiveSyncSource](#cdk-efs-assets-s3archivesyncsource)|*No description*
[StatefulFargateNginx](#cdk-efs-assets-statefulfargatenginx)|*No description*
[SyncSource](#cdk-efs-assets-syncsource)|*No description*
[SyncedAccessPoint](#cdk-efs-assets-syncedaccesspoint)|*No description*


**Structs**

Name|Description
----|-----------
[EfsFargateSiteProps](#cdk-efs-assets-efsfargatesiteprops)|*No description*
[EfsFargateTaskProps](#cdk-efs-assets-efsfargatetaskprops)|*No description*
[FargateTaskConfig](#cdk-efs-assets-fargatetaskconfig)|*No description*
[GithubSecret](#cdk-efs-assets-githubsecret)|*No description*
[GithubSourceProps](#cdk-efs-assets-githubsourceprops)|*No description*
[S3ArchiveSourceProps](#cdk-efs-assets-s3archivesourceprops)|*No description*
[StatefulFargateNginxProps](#cdk-efs-assets-statefulfargatenginxprops)|*No description*
[SyncSourceProps](#cdk-efs-assets-syncsourceprops)|*No description*
[SyncedAccessPointProps](#cdk-efs-assets-syncedaccesspointprops)|*No description*


**Enums**

Name|Description
----|-----------
[SyncEngine](#cdk-efs-assets-syncengine)|*No description*



## class EfsFargateSite  <a id="cdk-efs-assets-efsfargatesite"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new EfsFargateSite(scope: Construct, id: string, props: EfsFargateSiteProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[EfsFargateSiteProps](#cdk-efs-assets-efsfargatesiteprops)</code>)  *No description*
  * **accessPoint** (<code>[AccessPoint](#aws-cdk-aws-efs-accesspoint)</code>)  *No description* 
  * **task** (<code>[FargateTaskDefinition](#aws-cdk-aws-ecs-fargatetaskdefinition)</code>)  *No description* 
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  *No description* 



### Properties


Name | Type | Description 
-----|------|-------------
**service** | <code>[ApplicationLoadBalancedFargateService](#aws-cdk-aws-ecs-patterns-applicationloadbalancedfargateservice)</code> | <span></span>
**task** | <code>[FargateTaskDefinition](#aws-cdk-aws-ecs-fargatetaskdefinition)</code> | <span></span>



## class EfsFargateTask  <a id="cdk-efs-assets-efsfargatetask"></a>

Represents the AWS Fargate task with EFS and secret manager support.

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new EfsFargateTask(scope: Construct, id: string, props: EfsFargateTaskProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[EfsFargateTaskProps](#cdk-efs-assets-efsfargatetaskprops)</code>)  *No description*
  * **accessPoint** (<code>[AccessPoint](#aws-cdk-aws-efs-accesspoint)</code>)  *No description* 
  * **syncContainer** (<code>[ContainerDefinitionOptions](#aws-cdk-aws-ecs-containerdefinitionoptions)</code>)  *No description* 
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  *No description* 
  * **efsMountTarget** (<code>string</code>)  EFS mount target in the container. __*Default*__: /mnt/efsmount
  * **secret** (<code>[GithubSecret](#cdk-efs-assets-githubsecret)</code>)  *No description* __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**securityGroup** | <code>[SecurityGroup](#aws-cdk-aws-ec2-securitygroup)</code> | <span></span>
**task** | <code>[FargateTaskDefinition](#aws-cdk-aws-ecs-fargatetaskdefinition)</code> | <span></span>



## class GithubSyncSource  <a id="cdk-efs-assets-githubsyncsource"></a>



__Extends__: [SyncSource](#cdk-efs-assets-syncsource)

### Initializer




```ts
new GithubSyncSource(props: GithubSourceProps)
```

* **props** (<code>[GithubSourceProps](#cdk-efs-assets-githubsourceprops)</code>)  *No description*
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  The VPC of the Amazon EFS Filesystem. 
  * **syncDirectoryPath** (<code>string</code>)  The (absolute) directory path inside the EFS AccessPoint to sync files to. __*Optional*__
  * **timeout** (<code>[Duration](#aws-cdk-core-duration)</code>)  Timeout duration for sync Lambda function. __*Optional*__
  * **vpcSubnets** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  Where to place the network interfaces within the VPC. __*Optional*__
  * **repository** (<code>string</code>)  The github repository HTTP URI. 
  * **secret** (<code>[GithubSecret](#cdk-efs-assets-githubsecret)</code>)  The github secret for the private repository. __*Optional*__




## class S3ArchiveSyncSource  <a id="cdk-efs-assets-s3archivesyncsource"></a>



__Extends__: [SyncSource](#cdk-efs-assets-syncsource)

### Initializer




```ts
new S3ArchiveSyncSource(props: S3ArchiveSourceProps)
```

* **props** (<code>[S3ArchiveSourceProps](#cdk-efs-assets-s3archivesourceprops)</code>)  *No description*
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  The VPC of the Amazon EFS Filesystem. 
  * **syncDirectoryPath** (<code>string</code>)  The (absolute) directory path inside the EFS AccessPoint to sync files to. __*Optional*__
  * **timeout** (<code>[Duration](#aws-cdk-core-duration)</code>)  Timeout duration for sync Lambda function. __*Optional*__
  * **vpcSubnets** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  Where to place the network interfaces within the VPC. __*Optional*__
  * **bucket** (<code>[IBucket](#aws-cdk-aws-s3-ibucket)</code>)  The S3 bucket containing the archive file. 
  * **zipFilePath** (<code>string</code>)  The path of the zip file to extract in the S3 bucket. 
  * **syncOnUpdate** (<code>boolean</code>)  If this is set to true, then whenever a new object is uploaded to the specified path, an EFS sync will be triggered. __*Default*__: true




## class StatefulFargateNginx  <a id="cdk-efs-assets-statefulfargatenginx"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new StatefulFargateNginx(scope: Construct, id: string, props: StatefulFargateNginxProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[StatefulFargateNginxProps](#cdk-efs-assets-statefulfargatenginxprops)</code>)  *No description*
  * **efsFileSystem** (<code>[IFileSystem](#aws-cdk-aws-efs-ifilesystem)</code>)  The EFS FilesSystem as the stateful shared storage of the Fargate service. __*Default*__: create a new EFS FileSystem
  * **github** (<code>string</code>)  The github repository to clone as the doc root of the nginx. __*Default*__: https://github.com/cristurm/nyan-cat.git
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  The VPC for the fargate service. __*Default*__: create a new VPC


### Methods


#### createSyncedAccessPoint() <a id="cdk-efs-assets-statefulfargatenginx-createsyncedaccesspoint"></a>



```ts
createSyncedAccessPoint(): SyncedAccessPoint
```


__Returns__:
* <code>[SyncedAccessPoint](#cdk-efs-assets-syncedaccesspoint)</code>



## class SyncSource  <a id="cdk-efs-assets-syncsource"></a>



__Implemented by__: [GithubSyncSource](#cdk-efs-assets-githubsyncsource), [S3ArchiveSyncSource](#cdk-efs-assets-s3archivesyncsource)

### Initializer




```ts
new SyncSource()
```



### Methods


#### *static* github(props) <a id="cdk-efs-assets-syncsource-github"></a>



```ts
static github(props: GithubSourceProps): SyncSource
```

* **props** (<code>[GithubSourceProps](#cdk-efs-assets-githubsourceprops)</code>)  *No description*
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  The VPC of the Amazon EFS Filesystem. 
  * **syncDirectoryPath** (<code>string</code>)  The (absolute) directory path inside the EFS AccessPoint to sync files to. __*Optional*__
  * **timeout** (<code>[Duration](#aws-cdk-core-duration)</code>)  Timeout duration for sync Lambda function. __*Optional*__
  * **vpcSubnets** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  Where to place the network interfaces within the VPC. __*Optional*__
  * **repository** (<code>string</code>)  The github repository HTTP URI. 
  * **secret** (<code>[GithubSecret](#cdk-efs-assets-githubsecret)</code>)  The github secret for the private repository. __*Optional*__

__Returns__:
* <code>[SyncSource](#cdk-efs-assets-syncsource)</code>

#### *static* s3Archive(props) <a id="cdk-efs-assets-syncsource-s3archive"></a>



```ts
static s3Archive(props: S3ArchiveSourceProps): SyncSource
```

* **props** (<code>[S3ArchiveSourceProps](#cdk-efs-assets-s3archivesourceprops)</code>)  *No description*
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  The VPC of the Amazon EFS Filesystem. 
  * **syncDirectoryPath** (<code>string</code>)  The (absolute) directory path inside the EFS AccessPoint to sync files to. __*Optional*__
  * **timeout** (<code>[Duration](#aws-cdk-core-duration)</code>)  Timeout duration for sync Lambda function. __*Optional*__
  * **vpcSubnets** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  Where to place the network interfaces within the VPC. __*Optional*__
  * **bucket** (<code>[IBucket](#aws-cdk-aws-s3-ibucket)</code>)  The S3 bucket containing the archive file. 
  * **zipFilePath** (<code>string</code>)  The path of the zip file to extract in the S3 bucket. 
  * **syncOnUpdate** (<code>boolean</code>)  If this is set to true, then whenever a new object is uploaded to the specified path, an EFS sync will be triggered. __*Default*__: true

__Returns__:
* <code>[SyncSource](#cdk-efs-assets-syncsource)</code>



## class SyncedAccessPoint  <a id="cdk-efs-assets-syncedaccesspoint"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable), [IResource](#aws-cdk-core-iresource), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable), [IConstruct](#aws-cdk-core-iconstruct), [IAccessPoint](#aws-cdk-aws-efs-iaccesspoint), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable), [IConstruct](#aws-cdk-core-iconstruct), [IResource](#aws-cdk-core-iresource), [IAccessPoint](#aws-cdk-aws-efs-iaccesspoint), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable), [IConstruct](#aws-cdk-core-iconstruct), [IResource](#aws-cdk-core-iresource)
__Extends__: [AccessPoint](#aws-cdk-aws-efs-accesspoint)

### Initializer




```ts
new SyncedAccessPoint(scope: Construct, id: string, props: SyncedAccessPointProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[SyncedAccessPointProps](#cdk-efs-assets-syncedaccesspointprops)</code>)  *No description*
  * **createAcl** (<code>[Acl](#aws-cdk-aws-efs-acl)</code>)  Specifies the POSIX IDs and permissions to apply when creating the access point's root directory. __*Default*__: None. The directory specified by `path` must exist.
  * **path** (<code>string</code>)  Specifies the path on the EFS file system to expose as the root directory to NFS clients using the access point to access the EFS file system. __*Default*__: '/'
  * **posixUser** (<code>[PosixUser](#aws-cdk-aws-efs-posixuser)</code>)  The full POSIX identity, including the user ID, group ID, and any secondary group IDs, on the access point that is used for all file system operations performed by NFS clients using the access point. __*Default*__: user identity not enforced
  * **fileSystem** (<code>[IFileSystem](#aws-cdk-aws-efs-ifilesystem)</code>)  The efs filesystem. 
  * **syncSource** (<code>[SyncSource](#cdk-efs-assets-syncsource)</code>)  *No description* 
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  The VPC to run the sync job. 
  * **engine** (<code>[SyncEngine](#cdk-efs-assets-syncengine)</code>)  Trigger the sync with AWS Lambda or AWS Fargate. __*Optional*__




## struct EfsFargateSiteProps  <a id="cdk-efs-assets-efsfargatesiteprops"></a>






Name | Type | Description 
-----|------|-------------
**accessPoint** | <code>[AccessPoint](#aws-cdk-aws-efs-accesspoint)</code> | <span></span>
**task** | <code>[FargateTaskDefinition](#aws-cdk-aws-ecs-fargatetaskdefinition)</code> | <span></span>
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | <span></span>



## struct EfsFargateTaskProps  <a id="cdk-efs-assets-efsfargatetaskprops"></a>






Name | Type | Description 
-----|------|-------------
**accessPoint** | <code>[AccessPoint](#aws-cdk-aws-efs-accesspoint)</code> | <span></span>
**syncContainer** | <code>[ContainerDefinitionOptions](#aws-cdk-aws-ecs-containerdefinitionoptions)</code> | <span></span>
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | <span></span>
**efsMountTarget**? | <code>string</code> | EFS mount target in the container.<br/>__*Default*__: /mnt/efsmount
**secret**? | <code>[GithubSecret](#cdk-efs-assets-githubsecret)</code> | __*Optional*__



## struct FargateTaskConfig  <a id="cdk-efs-assets-fargatetaskconfig"></a>






Name | Type | Description 
-----|------|-------------
**securityGroup** | <code>[ISecurityGroup](#aws-cdk-aws-ec2-isecuritygroup)</code> | The security group of the fargate task.
**task** | <code>[TaskDefinition](#aws-cdk-aws-ecs-taskdefinition)</code> | <span></span>



## struct GithubSecret  <a id="cdk-efs-assets-githubsecret"></a>






Name | Type | Description 
-----|------|-------------
**id** | <code>string</code> | The secret ID from AWS Secrets Manager.
**key** | <code>string</code> | The key of the secret.



## struct GithubSourceProps  <a id="cdk-efs-assets-githubsourceprops"></a>






Name | Type | Description 
-----|------|-------------
**repository** | <code>string</code> | The github repository HTTP URI.
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The VPC of the Amazon EFS Filesystem.
**secret**? | <code>[GithubSecret](#cdk-efs-assets-githubsecret)</code> | The github secret for the private repository.<br/>__*Optional*__
**syncDirectoryPath**? | <code>string</code> | The (absolute) directory path inside the EFS AccessPoint to sync files to.<br/>__*Optional*__
**timeout**? | <code>[Duration](#aws-cdk-core-duration)</code> | Timeout duration for sync Lambda function.<br/>__*Optional*__
**vpcSubnets**? | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | Where to place the network interfaces within the VPC.<br/>__*Optional*__



## struct S3ArchiveSourceProps  <a id="cdk-efs-assets-s3archivesourceprops"></a>






Name | Type | Description 
-----|------|-------------
**bucket** | <code>[IBucket](#aws-cdk-aws-s3-ibucket)</code> | The S3 bucket containing the archive file.
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The VPC of the Amazon EFS Filesystem.
**zipFilePath** | <code>string</code> | The path of the zip file to extract in the S3 bucket.
**syncDirectoryPath**? | <code>string</code> | The (absolute) directory path inside the EFS AccessPoint to sync files to.<br/>__*Optional*__
**syncOnUpdate**? | <code>boolean</code> | If this is set to true, then whenever a new object is uploaded to the specified path, an EFS sync will be triggered.<br/>__*Default*__: true
**timeout**? | <code>[Duration](#aws-cdk-core-duration)</code> | Timeout duration for sync Lambda function.<br/>__*Optional*__
**vpcSubnets**? | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | Where to place the network interfaces within the VPC.<br/>__*Optional*__



## struct StatefulFargateNginxProps  <a id="cdk-efs-assets-statefulfargatenginxprops"></a>






Name | Type | Description 
-----|------|-------------
**efsFileSystem**? | <code>[IFileSystem](#aws-cdk-aws-efs-ifilesystem)</code> | The EFS FilesSystem as the stateful shared storage of the Fargate service.<br/>__*Default*__: create a new EFS FileSystem
**github**? | <code>string</code> | The github repository to clone as the doc root of the nginx.<br/>__*Default*__: https://github.com/cristurm/nyan-cat.git
**vpc**? | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The VPC for the fargate service.<br/>__*Default*__: create a new VPC



## struct SyncSourceProps  <a id="cdk-efs-assets-syncsourceprops"></a>






Name | Type | Description 
-----|------|-------------
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The VPC of the Amazon EFS Filesystem.
**syncDirectoryPath**? | <code>string</code> | The (absolute) directory path inside the EFS AccessPoint to sync files to.<br/>__*Optional*__
**timeout**? | <code>[Duration](#aws-cdk-core-duration)</code> | Timeout duration for sync Lambda function.<br/>__*Optional*__
**vpcSubnets**? | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | Where to place the network interfaces within the VPC.<br/>__*Optional*__



## struct SyncedAccessPointProps  <a id="cdk-efs-assets-syncedaccesspointprops"></a>






Name | Type | Description 
-----|------|-------------
**fileSystem** | <code>[IFileSystem](#aws-cdk-aws-efs-ifilesystem)</code> | The efs filesystem.
**syncSource** | <code>[SyncSource](#cdk-efs-assets-syncsource)</code> | <span></span>
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The VPC to run the sync job.
**createAcl**? | <code>[Acl](#aws-cdk-aws-efs-acl)</code> | Specifies the POSIX IDs and permissions to apply when creating the access point's root directory.<br/>__*Default*__: None. The directory specified by `path` must exist.
**engine**? | <code>[SyncEngine](#cdk-efs-assets-syncengine)</code> | Trigger the sync with AWS Lambda or AWS Fargate.<br/>__*Optional*__
**path**? | <code>string</code> | Specifies the path on the EFS file system to expose as the root directory to NFS clients using the access point to access the EFS file system.<br/>__*Default*__: '/'
**posixUser**? | <code>[PosixUser](#aws-cdk-aws-efs-posixuser)</code> | The full POSIX identity, including the user ID, group ID, and any secondary group IDs, on the access point that is used for all file system operations performed by NFS clients using the access point.<br/>__*Default*__: user identity not enforced



## enum SyncEngine  <a id="cdk-efs-assets-syncengine"></a>



Name | Description
-----|-----
**FARGATE** |
**LAMBDA** |


