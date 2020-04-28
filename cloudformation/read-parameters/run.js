const core = require('@actions/core');

const { readParameters } = require('.');

const { AWS_REGION } = process.env;

const main = async () => {
  try {
    await readParameters({ pathPrefix: core.getInput('path') }, core);
    return true;
  } catch (error) {
    core.setFailed(error.message);
  }
};

if (!AWS_REGION) {
  throw new Error('"AWS_REGION" environment variable is not defined.');
}

main();
