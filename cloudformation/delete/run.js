const core = require('@actions/core');

const { deleteStack } = require('.');

const { AWS_REGION } = process.env;

try {
  if (!AWS_REGION) {
    throw new Error('"AWS_REGION" environment variable is not defined.');
  }

  const deleteParams = {
    stackName: core.getInput('stack-name'),
  };

  deleteStack(deleteParams, core);
} catch (error) {
  core.setFailed(error.message);
}
