import * as ec2 from '@aws-cdk/aws-ec2';
import * as efs from '@aws-cdk/aws-efs';
import * as cdk from '@aws-cdk/core';

export interface CommonEfsAssetsProps {
  /**
   * The target Amazon EFS filesystem to clone the github repository to.
   */
  readonly efsAccessPoint: efs.IAccessPoint;
  /**
   * The VPC of the Amazon EFS Filesystem.
   */
  readonly vpc: ec2.IVpc;
  /**
   * Where to place the network interfaces within the VPC.
   */
  readonly vpcSubnets?: ec2.SubnetSelection;
  /**
   * The dependent resources before triggering the sync.
   */
  readonly runsAfter?: cdk.IDependable[];
}
