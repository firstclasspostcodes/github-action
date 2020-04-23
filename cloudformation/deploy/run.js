const core = require('@actions/core');

const { deployStack } = require('.');

const { AWS_REGION } = process.env;

try {
  if (!AWS_REGION) {
    throw new Error('"AWS_REGION" environment variable is not defined.');
  }

  const deployParams = {
    changeSetName: `c-${process.env.GITHUB_SHA}`,
    parameters: core.getInput('parameters'),
    stackName: core.getInput('stack-name'),
    capabilities: core.getInput('capabilities').split(','),
    templateFilePath: core.getInput('template-file'),
    artifactName: core.getInput('artifact-name'),
  };

  deployStack(deployParams, core);
} catch (error) {
  core.setFailed(error.message);
}
