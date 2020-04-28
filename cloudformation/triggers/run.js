const core = require('@actions/core');
const minimist = require('minimist');

const { deployStack } = require('../deploy');

const TEMPLATE_FILE_PATH = '/command/cloudformation/triggers/trigger.yml';

const argv = minimist(process.argv.slice(2));

const {
  name,
  token,
  ['event-pattern']: eventPattern,
  ['event-type']: eventType,
} = argv;

const changeSetName = `c-${process.env.GITHUB_SHA}`;

const parameters = {
  Token: token,
  EventPattern: eventPattern,
  EventType: eventType,
  Repository: process.env.GITHUB_REPOSITORY,
};

const capabilities = ['CAPABILITY_IAM', 'CAPABILITY_AUTO_EXPAND'];

const sanitizedRepositoryName = process.env.GITHUB_REPOSITORY.replace(
  /[^a-z0-9]/g,
  '-'
);

const stackName = `${sanitizedRepositoryName}--${name}`;

const main = async () => {
  try {
    await deployStack(
      {
        templateFilePath: TEMPLATE_FILE_PATH,
        changeSetName,
        parameters,
        stackName,
        capabilities,
      },
      core
    );
  } catch (error) {
    core.setFailed(error.message);
    process.exit(1);
  }
};

main();