const core = require('@actions/core');

const { deployStack } = require('../deploy');

const TEMPLATE_FILE_PATH = '/command/cloudformation/triggers/trigger.yml';

const main = async () => {
  try {
    const name = core.getInput('name');

    const changeSetName = `c-${process.env.GITHUB_SHA}`;

    const parameters = {
      Token: core.getInput('token'),
      EventPattern: core.getInput('event-pattern'),
      EventType: core.getInput('event-type'),
      Repository: process.env.GITHUB_REPOSITORY,
    };

    const capabilities = ['CAPABILITY_IAM', 'CAPABILITY_AUTO_EXPAND'];

    const sanitizedRepositoryName = process.env.GITHUB_REPOSITORY.replace(
      /[^a-z0-9]/g,
      '-'
    );

    const stackName = `${sanitizedRepositoryName}--${name}`;

    const deployParams = {
      templateFilePath: TEMPLATE_FILE_PATH,
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
