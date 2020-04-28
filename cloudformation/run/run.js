const core = require('@actions/core');

const { packageTemplate } = require('../package-template');
const { deployStack } = require('../deploy');
const { readOutputs } = require('../read-outputs');

const main = async () => {
  const changeSetName = `c-${process.env.GITHUB_SHA}`;

  const artifactName = core.getInput('artifact-name');

  const stackName = core.getInput('stack-name');
  try {
    const packageTemplateParams = {
      templateFile: core.getInput('template-file'),
      s3Bucket: core.getInput('s3-bucket'),
      s3Prefix: core.getInput('s3-prefix'),
      kmsKeyId: core.getInput('kms-key-id'),
      artifactName,
    };

    const deployStackParams = {
      changeSetName,
      artifactName,
      stackName,
      parameters: core.getInput('parameters'),
      tags: core.getInput('tags'),
      capabilities: core.getInput('capabilities').split(','),
    };

    await packageTemplate(packageTemplateParams, core);

    await deployStack(deployStackParams, core);

    await readOutputs({ stackName }, core);
  } catch (error) {
    core.setFailed(error.message);
    process.exit(1);
  }
};

main();
