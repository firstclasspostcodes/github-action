const core = require('@actions/core');

const { deployStack } = require('../deploy');

const template = require('./trigger.json');

const main = async () => {
  try {
    const stackName = core.getInput('stack-name');

    const changeSetName = `c-${process.env.GITHUB_SHA}`;

    const parameters = {
      Token: core.getInput('token'),
      EventPattern: core.getInput('event-pattern'),
      EventType: core.getInput('event-type'),
      Repository: process.env.GITHUB_REPOSITORY,
    };

    const capabilities = ['CAPABILITY_IAM', 'CAPABILITY_AUTO_EXPAND'];

    const deployParams = {
      templateBody: JSON.stringify(template),
      changeSetName,
      parameters,
      stackName,
      capabilities,
    };

    await deployStack(deployParams, core);

    return true;
  } catch (error) {
    core.setFailed(error.message);
    process.exit(1);
  }
};

main();
