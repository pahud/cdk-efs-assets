const {
  AwsCdkConstructLibrary,
} = require('projen');

const AUTOMATION_TOKEN = 'AUTOMATION_GITHUB_TOKEN';

const project = new AwsCdkConstructLibrary({
  authorAddress: 'pahudnet@gmail.com',
  authorName: 'Pahud Hsieh',
  cdkVersion: '1.83.0',
  name: 'cdk-efs-assets',
  repository: 'https://github.com/pahud/cdk-efs-assets.git',
  description: 'Amazon EFS assets from Github repositories or S3 buckets',
  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-ecs',
    '@aws-cdk/aws-efs',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-logs',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-ecs-patterns',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-secretsmanager',
    '@aws-cdk/custom-resources',
  ],
  deps: ['cdk-fargate-run-task'],
  peerDeps: ['cdk-fargate-run-task'],
  dependabot: false,
  defaultReleaseBranch: 'main',
  keywords: [
    'aws',
    'cdk',
    'efs',
    'github',
  ],

  catalog: {
    twitter: 'pahudnet',
    announce: false,
  },

  python: {
    distName: 'cdk-efs-assets',
    module: 'cdk_efs_assets',
  },
});

// create a custom projen and yarn upgrade workflow
const workflow = project.github.addWorkflow('ProjenYarnUpgrade');

workflow.on({
  schedule: [{
    cron: '11 0 * * *',
  }], // 0:11am every day
  workflow_dispatch: {}, // allow manual triggering
});

workflow.addJobs({
  upgrade: {
    'runs-on': 'ubuntu-latest',
    'steps': [
      { uses: 'actions/checkout@v2' },
      {
        uses: 'actions/setup-node@v1',
        with: {
          'node-version': '10.17.0',
        },
      },
      { run: 'yarn upgrade' },
      { run: 'yarn projen:upgrade' },
      // submit a PR
      {
        name: 'Create Pull Request',
        uses: 'peter-evans/create-pull-request@v3',
        with: {
          'token': '${{ secrets.' + AUTOMATION_TOKEN + ' }}',
          'commit-message': 'chore: upgrade projen',
          'branch': 'auto/projen-upgrade',
          'title': 'chore: upgrade projen and yarn',
          'body': 'This PR upgrades projen and yarn upgrade to the latest version',
          'labels': 'auto-merge',
        },
      },
    ],
  },
});


const common_exclude = ['cdk.out', 'cdk.context.json', 'images', 'yarn-error.log', '*.zip'];
project.npmignore.exclude(...common_exclude);
project.gitignore.exclude(...common_exclude);

project.synth();
