const CloudFormation = require('aws-sdk/clients/cloudformation');

const { AWS_REGION } = process.env;

const cloudformation = new CloudFormation({ region: AWS_REGION });

const toKey = (key, char = '_') =>
  key
    .replace(/^\//, '')
    .replace(/\//g, char)
    .replace(/([a-z])([A-Z])/g, `$1${char}$2`);

const toEnvKey = (key) => toKey(key, '_').toUpperCase();

const toOutputKey = (key) => toKey(key, '-').toLowerCase();

const readOutputs = async ({ stackName }, step) => {
  try {
    step.startGroup(`Reading outputs for stack: ${stackName}`);

    const { Stacks: [stack] = [] } = await cloudformation
      .describeStacks({ StackName: stackName })
      .promise();

    const { Outputs: outputs } = stack;

    outputs.forEach(({ OutputKey: key, OutputValue: value }) => {
      step.debug(`Output: "${key}" = "${value}"`);
      step.setOutput(toOutputKey(key), value);
      step.exportVariable(toEnvKey(key), value);
      return true;
    });

    step.endGroup();

    return true;
  } catch (err) {
    throw new Error(`The stack "${stackName} does not exist.`);
  }
};

module.exports = {
  readOutputs,
};
