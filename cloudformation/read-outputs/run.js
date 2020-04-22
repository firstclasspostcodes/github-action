const core = require('@actions/core');

const { readOutputs } = require('.');

const { AWS_REGION } = process.env;

try {
  if (!AWS_REGION) {
    throw new Error('"AWS_REGION" environment variable is not defined.');
  }
  readOutputs({ stackName: core.getInput('stack-name') }, core);
} catch (error) {
  core.setFailed(error.message);
}
