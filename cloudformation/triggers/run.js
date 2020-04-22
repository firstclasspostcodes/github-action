const core = require('@actions/core');
const minimist = require('minimist');

const { deployStack } = require('../deploy');

const argv = minimist(process.argv.slice(2));

const templateFilePath = `${__dirname}/trigger.yml`;

const {
  name: stackName,
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

const main = async () => {
  try {
    await deployStack(
      {
        changeSetName,
        parameters,
        stackName,
        templateFilePath,
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
