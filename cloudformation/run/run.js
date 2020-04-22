const minimist = require('minimist');

const { packageTemplate } = require('../package-template');
const { deployStack } = require('../deploy');
const { readOutputs } = require('../read-outputs');

const argv = minimist(process.argv.slice(2));

const {
  ['parameters']: parameters,
  ['capabilities']: capabilities,
  ['stack-name']: stackName,
  ['template-file']: templateFile,
  ['s3-bucket']: s3Bucket,
  ['s3-prefix']: s3Prefix,
  ['kms-key-id']: kmsKeyId,
  ['artifact-name']: artifactName,
} = argv;

const changeSetName = process.env.GITHUB_SHA;

const stepHandler = {
  debug: console.log,
  setOutput: (key, value) =>
    console.log(`::set-output ${key}=string::${value}`),
  exportVariable: (key, value) => console.log(`export ${key}=${value}`),
};

const main = async () => {
  await packageTemplate({
    templateFile,
    s3Bucket,
    s3Prefix,
    kmsKeyId,
    artifactName,
  });

  await deployStack({
    changeSetName,
    parameters,
    stackName,
    templateFilePath: templateFile,
    artifactName,
    capabilities: capabilities.split(','),
  });

  await readOutputs({ stackName }, stepHandler);
};

main();
