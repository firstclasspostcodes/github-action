const SSM = require('aws-sdk/clients/ssm');

const { AWS_REGION } = process.env;

const ssm = new SSM({ region: AWS_REGION });

const toKey = (key, char = '_') =>
  key
    .replace(/^\//, '')
    .replace(/\//g, char)
    .replace(/([a-z])([A-Z])/g, `$1${char}$2`);

const toEnvKey = (key) => toKey(key, '_').toUpperCase();

const toOutputKey = (key) => toKey(key, '-').toLowerCase();

const readParameters = async ({ pathPrefix }, step) => {
  step.startGroup(`Reading parameters with prefix: ${pathPrefix}`);

  const paths = pathPrefix
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  await Promise.all(
    paths.map(async (path) => {
      const { Parameters } = await ssm
        .getParametersByPath({ Path: path, Recursive: true })
        .promise();

      Parameters.forEach(({ Name: name, Value: value }) => {
        step.debug(`Setting: "${name}" = "${value}"`);
        step.setOutput(toOutputKey(name), value);
        step.exportVariable(toEnvKey(name), value);
        return true;
      });

      return true;
    })
  );

  step.endGroup();

  return true;
};

module.exports = {
  readParameters,
};
