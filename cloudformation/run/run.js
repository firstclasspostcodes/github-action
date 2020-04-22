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
  debug: (str) => console.log(`::debug:: ${str}`),
  setOutput: (key, value) =>
    console.log(`::set-output ${key}=string::${value}`),
  exportVariable: (key, value) => console.log(`export ${key}=${value}`),
};

const main = async () => {
  try {
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
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();
