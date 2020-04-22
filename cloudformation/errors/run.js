const core = require('@actions/core');

const { listStackEvents } = require('.');

const { AWS_REGION } = process.env;

try {
  if (!AWS_REGION) {
    throw new Error('"AWS_REGION" environment variable is not defined.');
  }

  const listParams = {
    stackName: core.getInput('stack-name'),
  };

  listStackEvents(listParams, core);
} catch (error) {
  core.setFailed(error.message);
}
