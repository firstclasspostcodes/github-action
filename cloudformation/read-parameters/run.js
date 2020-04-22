const core = require('@actions/core');

const { readParameters } = require('.');

const { AWS_REGION } = process.env;

try {
  if (!AWS_REGION) {
    throw new Error('"AWS_REGION" environment variable is not defined.');
  }
  readParameters({ pathPrefix: core.getInput('path') }, core);
} catch (error) {
  core.setFailed(error.message);
}
