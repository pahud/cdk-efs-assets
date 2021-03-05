import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as patterns from '@aws-cdk/aws-ecs-patterns';
import * as efs from '@aws-cdk/aws-efs';
import * as cdk from '@aws-cdk/core';


export interface EfsFargateSiteProps {
  readonly vpc: ec2.IVpc;
  readonly task: ecs.FargateTaskDefinition;
  readonly accessPoint: efs.AccessPoint;
}

export class EfsFargateSite extends cdk.Construct {
  readonly task: ecs.FargateTaskDefinition;
  readonly service: patterns.ApplicationLoadBalancedFargateService;
  constructor(scope: cdk.Construct, id: string, props: EfsFargateSiteProps) {
    super(scope, id);

    this.task = props.task;

    this.task.addVolume({
      name: 'efs-storage',
      efsVolumeConfiguration: {
        fileSystemId: props.accessPoint.fileSystem.fileSystemId,
      },
    });

    this.service = new patterns.ApplicationLoadBalancedFargateService(this, 'FargateService', {
      taskDefinition: this.task,
      platformVersion: ecs.FargatePlatformVersion.VERSION1_4,
    });
  }
}
