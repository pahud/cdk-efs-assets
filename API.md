# API Reference

**Classes**

Name|Description
----|-----------
[SyncSource](#cdk-efs-assets-syncsource)|*No description*
[SyncedAccessPoint](#cdk-efs-assets-syncedaccesspoint)|*No description*


**Structs**

Name|Description
----|-----------
[GithubSourceProps](#cdk-efs-assets-githubsourceprops)|*No description*
[S3ArchiveSourceProps](#cdk-efs-assets-s3archivesourceprops)|*No description*
[SyncSourceProps](#cdk-efs-assets-syncsourceprops)|*No description*
[SyncedAccessPointProps](#cdk-efs-assets-syncedaccesspointprops)|*No description*



## class SyncSource  <a id="cdk-efs-assets-syncsource"></a>




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
  * **timeout** (<code>[Duration](#aws-cdk-core-duration)</code>)  Timeout duration for sync Lambda function. __*Optional*__
  * **vpcSubnets** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  Where to place the network interfaces within the VPC. __*Optional*__
  * **repository** (<code>string</code>)  The github repository HTTP URI. 

__Returns__:
* <code>[SyncSource](#cdk-efs-assets-syncsource)</code>

#### *static* s3Archive(props) <a id="cdk-efs-assets-syncsource-s3archive"></a>



```ts
static s3Archive(props: S3ArchiveSourceProps): SyncSource
```

* **props** (<code>[S3ArchiveSourceProps](#cdk-efs-assets-s3archivesourceprops)</code>)  *No description*
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  The VPC of the Amazon EFS Filesystem. 
  * **timeout** (<code>[Duration](#aws-cdk-core-duration)</code>)  Timeout duration for sync Lambda function. __*Optional*__
  * **vpcSubnets** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  Where to place the network interfaces within the VPC. __*Optional*__
  * **bucket** (<code>[IBucket](#aws-cdk-aws-s3-ibucket)</code>)  The S3 bucket containing the archive file. 
  * **zipFilePath** (<code>string</code>)  The path of the zip file to extract in the S3 bucket. 
  * **syncOnUpdate** (<code>boolean</code>)  If this is set to true, then whenever a new object is uploaded to the specified path, an EFS sync will be triggered. __*Optional*__

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




## struct GithubSourceProps  <a id="cdk-efs-assets-githubsourceprops"></a>






Name | Type | Description 
-----|------|-------------
**repository** | <code>string</code> | The github repository HTTP URI.
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The VPC of the Amazon EFS Filesystem.
**timeout**? | <code>[Duration](#aws-cdk-core-duration)</code> | Timeout duration for sync Lambda function.<br/>__*Optional*__
**vpcSubnets**? | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | Where to place the network interfaces within the VPC.<br/>__*Optional*__



## struct S3ArchiveSourceProps  <a id="cdk-efs-assets-s3archivesourceprops"></a>






Name | Type | Description 
-----|------|-------------
**bucket** | <code>[IBucket](#aws-cdk-aws-s3-ibucket)</code> | The S3 bucket containing the archive file.
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The VPC of the Amazon EFS Filesystem.
**zipFilePath** | <code>string</code> | The path of the zip file to extract in the S3 bucket.
**syncOnUpdate**? | <code>boolean</code> | If this is set to true, then whenever a new object is uploaded to the specified path, an EFS sync will be triggered.<br/>__*Optional*__
**timeout**? | <code>[Duration](#aws-cdk-core-duration)</code> | Timeout duration for sync Lambda function.<br/>__*Optional*__
**vpcSubnets**? | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | Where to place the network interfaces within the VPC.<br/>__*Optional*__



## struct SyncSourceProps  <a id="cdk-efs-assets-syncsourceprops"></a>






Name | Type | Description 
-----|------|-------------
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The VPC of the Amazon EFS Filesystem.
**timeout**? | <code>[Duration](#aws-cdk-core-duration)</code> | Timeout duration for sync Lambda function.<br/>__*Optional*__
**vpcSubnets**? | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | Where to place the network interfaces within the VPC.<br/>__*Optional*__



## struct SyncedAccessPointProps  <a id="cdk-efs-assets-syncedaccesspointprops"></a>






Name | Type | Description 
-----|------|-------------
**fileSystem**🔹 | <code>[IFileSystem](#aws-cdk-aws-efs-ifilesystem)</code> | The efs filesystem.
**syncSource** | <code>[SyncSource](#cdk-efs-assets-syncsource)</code> | <span></span>
**createAcl**?🔹 | <code>[Acl](#aws-cdk-aws-efs-acl)</code> | Specifies the POSIX IDs and permissions to apply when creating the access point's root directory.<br/>__*Default*__: None. The directory specified by `path` must exist.
**path**?🔹 | <code>string</code> | Specifies the path on the EFS file system to expose as the root directory to NFS clients using the access point to access the EFS file system.<br/>__*Default*__: '/'
**posixUser**?🔹 | <code>[PosixUser](#aws-cdk-aws-efs-posixuser)</code> | The full POSIX identity, including the user ID, group ID, and any secondary group IDs, on the access point that is used for all file system operations performed by NFS clients using the access point.<br/>__*Default*__: user identity not enforced



