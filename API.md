# API Reference

**Classes**

Name|Description
----|-----------
[GithubSourceSync](#cdk-efs-assets-githubsourcesync)|*No description*
[S3ArchiveSync](#cdk-efs-assets-s3archivesync)|*No description*


**Structs**

Name|Description
----|-----------
[CommonEfsAssetsProps](#cdk-efs-assets-commonefsassetsprops)|*No description*
[GithubSourceFeederProps](#cdk-efs-assets-githubsourcefeederprops)|*No description*
[S3ArchiveFeederProps](#cdk-efs-assets-s3archivefeederprops)|*No description*



## class GithubSourceSync  <a id="cdk-efs-assets-githubsourcesync"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new GithubSourceSync(scope: Construct, id: string, props: GithubSourceFeederProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[GithubSourceFeederProps](#cdk-efs-assets-githubsourcefeederprops)</code>)  *No description*
  * **efsAccessPoint** (<code>[IAccessPoint](#aws-cdk-aws-efs-iaccesspoint)</code>)  The target Amazon EFS filesystem to clone the github repository to. 
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  The VPC of the Amazon EFS Filesystem. 
  * **runsAfter** (<code>Array<[IDependable](#aws-cdk-core-idependable)></code>)  The dependent resources before triggering the sync. __*Optional*__
  * **vpcSubnets** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  Where to place the network interfaces within the VPC. __*Optional*__
  * **repository** (<code>string</code>)  The github repository HTTP URI. 




## class S3ArchiveSync  <a id="cdk-efs-assets-s3archivesync"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new S3ArchiveSync(scope: Construct, id: string, props: S3ArchiveFeederProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[S3ArchiveFeederProps](#cdk-efs-assets-s3archivefeederprops)</code>)  *No description*
  * **efsAccessPoint** (<code>[IAccessPoint](#aws-cdk-aws-efs-iaccesspoint)</code>)  The target Amazon EFS filesystem to clone the github repository to. 
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  The VPC of the Amazon EFS Filesystem. 
  * **runsAfter** (<code>Array<[IDependable](#aws-cdk-core-idependable)></code>)  The dependent resources before triggering the sync. __*Optional*__
  * **vpcSubnets** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  Where to place the network interfaces within the VPC. __*Optional*__
  * **bucket** (<code>[IBucket](#aws-cdk-aws-s3-ibucket)</code>)  The S3 bucket containing the archive file. 
  * **zipFilePath** (<code>string</code>)  The path of the zip file to extract in the S3 bucket. 
  * **shouldMonitorS3Path** (<code>boolean</code>)  If this is set to true, then whenever a new object is uploaded to the specified path, an EFS sync will be triggered. __*Optional*__




## struct CommonEfsAssetsProps  <a id="cdk-efs-assets-commonefsassetsprops"></a>






Name | Type | Description 
-----|------|-------------
**efsAccessPoint** | <code>[IAccessPoint](#aws-cdk-aws-efs-iaccesspoint)</code> | The target Amazon EFS filesystem to clone the github repository to.
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The VPC of the Amazon EFS Filesystem.
**runsAfter**? | <code>Array<[IDependable](#aws-cdk-core-idependable)></code> | The dependent resources before triggering the sync.<br/>__*Optional*__
**vpcSubnets**? | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | Where to place the network interfaces within the VPC.<br/>__*Optional*__



## struct GithubSourceFeederProps  <a id="cdk-efs-assets-githubsourcefeederprops"></a>






Name | Type | Description 
-----|------|-------------
**efsAccessPoint** | <code>[IAccessPoint](#aws-cdk-aws-efs-iaccesspoint)</code> | The target Amazon EFS filesystem to clone the github repository to.
**repository** | <code>string</code> | The github repository HTTP URI.
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The VPC of the Amazon EFS Filesystem.
**runsAfter**? | <code>Array<[IDependable](#aws-cdk-core-idependable)></code> | The dependent resources before triggering the sync.<br/>__*Optional*__
**vpcSubnets**? | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | Where to place the network interfaces within the VPC.<br/>__*Optional*__



## struct S3ArchiveFeederProps  <a id="cdk-efs-assets-s3archivefeederprops"></a>






Name | Type | Description 
-----|------|-------------
**bucket** | <code>[IBucket](#aws-cdk-aws-s3-ibucket)</code> | The S3 bucket containing the archive file.
**efsAccessPoint** | <code>[IAccessPoint](#aws-cdk-aws-efs-iaccesspoint)</code> | The target Amazon EFS filesystem to clone the github repository to.
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | The VPC of the Amazon EFS Filesystem.
**zipFilePath** | <code>string</code> | The path of the zip file to extract in the S3 bucket.
**runsAfter**? | <code>Array<[IDependable](#aws-cdk-core-idependable)></code> | The dependent resources before triggering the sync.<br/>__*Optional*__
**shouldMonitorS3Path**? | <code>boolean</code> | If this is set to true, then whenever a new object is uploaded to the specified path, an EFS sync will be triggered.<br/>__*Optional*__
**vpcSubnets**? | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | Where to place the network interfaces within the VPC.<br/>__*Optional*__



