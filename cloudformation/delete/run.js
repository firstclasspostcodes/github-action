const core = require('@actions/core');

const { deleteStack } = require('.');

const { AWS_REGION } = process.env;

const main = async () => {
  try {
    const deleteParams = {
      stackName: core.getInput('stack-name'),
    };

    await deleteStack(deleteParams, core);

    return true;
  } catch (error) {
    core.setFailed(error.message);
  }
};

if (!AWS_REGION) {
  throw new Error('"AWS_REGION" environment variable is not defined.');
}

main();
