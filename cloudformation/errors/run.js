const core = require('@actions/core');

const { listStackEvents } = require('.');

const { AWS_REGION } = process.env;

const main = async () => {
  try {
    const listParams = {
      stackName: core.getInput('stack-name'),
    };

    await listStackEvents(listParams, core);

    return true;
  } catch (error) {
    core.setFailed(error.message);
  }
};

if (!AWS_REGION) {
  throw new Error('"AWS_REGION" environment variable is not defined.');
}

main();
