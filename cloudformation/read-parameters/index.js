const core = require('@actions/core');
const SSM = require('aws-sdk/clients/ssm');

const { AWS_REGION } = process.env;

const ssm = new SSM({ region: AWS_REGION });

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
  const pathPrefix = core.getInput('path');

  const { Parameters } = await ssm
    .getParametersByPath({ Path: pathPrefix, Recursive: true })
    .promise();

  Parameters.forEach(({ Name: name, Value: value }) => {
    core.debug(`Setting: "${name}" = "${value}"`);
    core.setOutput(toOutputKey(name), value);
    core.exportVariable(toEnvKey(name), value);
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
