const core = require('@actions/core');

const { readOutputs } = require('.');

const { AWS_REGION } = process.env;

const main = async () => {
  try {
    await readOutputs({ stackName: core.getInput('stack-name') }, core);

    return true;
  } catch (error) {
    core.setFailed(error.message);
  }
};

if (!AWS_REGION) {
  throw new Error('"AWS_REGION" environment variable is not defined.');
}

main();
