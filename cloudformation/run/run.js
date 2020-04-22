const core = require('@actions/core');
const minimist = require('minimist');

const { packageTemplate } = require('../package-template');
const { deployStack } = require('../deploy');
const { readOutputs } = require('../read-outputs');

const argv = minimist(process.argv.slice(2));

const {
  ['parameters']: parameters,
  ['capabilities']: capabilities,
  ['stack-name']: stackName,
  ['template-file']: templateFile,
  ['s3-bucket']: s3Bucket,
  ['s3-prefix']: s3Prefix,
  ['kms-key-id']: kmsKeyId,
  ['artifact-name']: artifactName,
} = argv;

const changeSetName = `c-${process.env.GITHUB_SHA}`;

const main = async () => {
  try {
    await packageTemplate(
      {
        templateFile,
        s3Bucket,
        s3Prefix,
        kmsKeyId,
        artifactName,
      },
      core
    );

    await deployStack(
      {
        changeSetName,
        parameters,
        stackName,
        artifactName,
        capabilities: capabilities.split(','),
      },
      core
    );

    await readOutputs({ stackName }, core);
  } catch (error) {
    core.setFailed(error.message);
    process.exit(1);
  }
};

main();
