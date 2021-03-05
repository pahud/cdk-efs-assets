import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as efs from '@aws-cdk/aws-efs';
import { RemovalPolicy, Construct } from '@aws-cdk/core';
import { EfsFargateSite } from './efs-fargate-site';
import { SyncedAccessPoint, GithubSyncSource } from './synced-access-point';


export interface StatefulFargateNginxProps {
  /**
   * The VPC for the fargate service
   *
   * @default - create a new VPC
   */
  readonly vpc?: ec2.IVpc;
  /**
   * The github repository to clone as the doc root of the nginx
   * @default https://github.com/cristurm/nyan-cat.git
   */
  readonly github?: string;
  /**
   * The EFS FilesSystem as the stateful shared storage of the Fargate service
   *
   * @default - create a new EFS FileSystem
   */
  readonly efsFileSystem?: efs.IFileSystem;
}

export class StatefulFargateNginx extends Construct {
  private props: StatefulFargateNginxProps;
  private vpc: ec2.IVpc;
  constructor(scope: Construct, id: string, props: StatefulFargateNginxProps) {
    super(scope, id);
    this.props = props;
    this.vpc = this.props.vpc ?? this._createVpc();

    const staticSiteTask = new ecs.FargateTaskDefinition(this, 'FargateStaticSiteTask', {
      cpu: 256,
      memoryLimitMiB: 512,
    });
    const nginx = staticSiteTask.addContainer('nginx', {
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/nginx/nginx:latest'),
      logging: new ecs.AwsLogDriver({ streamPrefix: 'nginx' }),
    });
    nginx.addPortMappings({ containerPort: 80 });
    nginx.addMountPoints({
      containerPath: '/usr/share/nginx/html',
      sourceVolume: 'efs-storage',
      readOnly: true,
    });
    new EfsFargateSite(this, 'StatefulSite', {
      vpc: this.vpc,
      accessPoint: this.createSyncedAccessPoint(),
      task: staticSiteTask,
    });
  }
  private _createVpc(): ec2.Vpc {
    return new ec2.Vpc(this, 'Vpc', { maxAzs: 3, natGateways: 1 });
  };
  private _createEfsFileSystem(): efs.FileSystem {
    return new efs.FileSystem(this, 'Filesystem', {
      vpc: this.vpc,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
  public createSyncedAccessPoint(): SyncedAccessPoint {
    const efsSyncedAccessPoint = new SyncedAccessPoint(this, 'GithubSyncedAccessPoint', {
      vpc: this.vpc,
      fileSystem: this.props.efsFileSystem ?? this._createEfsFileSystem(),
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
        vpc: this.vpc,
        repository: this.props.github ?? 'https://github.com/cristurm/nyan-cat.git',
        syncDirectoryPath: '/',
      }),
    });
    return efsSyncedAccessPoint;
  }
}
