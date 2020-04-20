const core = require('@actions/core');
const CloudFormation = require('aws-sdk/clients/cloudformation');

const { AWS_REGION } = process.env;

const cloudformation = new CloudFormation({ region: AWS_REGION });

const toEnvKey = (key) =>
  key
    .replace(/^\//, '')
    .replace(/\//g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();

const toOutputKey = (key) =>
  key
    .replace(/^\//, '')
    .replace(/\//g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();

const main = async () => {
  const stackName = core.getInput('stack-name');

  const {
    Stacks: [stack],
  } = await cloudformation.describeStacks({ StackName: stackName }).promise();

  if (!stack) {
    throw new Error(`The stack "${stackName} does not exist.`);
  }

  const { Outputs: outputs } = stack;

  outputs.forEach(({ OutputKey: key, OutputValue: value }) => {
    core.debug(`Output: "${key}" = "${value}"`);
    core.setOutput(toOutputKey(key), value);
    core.exportVariable(toEnvKey(key), value);
    return true;
  });

  return true;
};

try {
  if (!AWS_REGION) {
    throw new Error('"AWS_REGION" environment variable is not defined.');
  }
  main();
} catch (error) {
  core.setFailed(error.message);
}
