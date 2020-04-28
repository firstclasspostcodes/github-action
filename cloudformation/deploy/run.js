const core = require('@actions/core');

const { deployStack } = require('.');

const { AWS_REGION } = process.env;

const main = async () => {
  try {
    const deployParams = {
      changeSetName: `c-${process.env.GITHUB_SHA}`,
      parameters: core.getInput('parameters'),
      tags: core.getInput('tags'),
      stackName: core.getInput('stack-name'),
      capabilities: core.getInput('capabilities').split(','),
      templateFilePath: core.getInput('template-file'),
      artifactName: core.getInput('artifact-name'),
    };

    await deployStack(deployParams, core);

    return true;
  } catch (error) {
    core.setFailed(error.message);
  }
};

if (!AWS_REGION) {
  throw new Error('"AWS_REGION" environment variable is not defined.');
}

main();
