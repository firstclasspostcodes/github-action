const core = require('@actions/core');
const minimist = require('minimist');

const { packageTemplate } = require('.');

const argv = minimist(process.argv.slice(2));

const {
  ['template-file']: templateFile,
  ['s3-bucket']: s3Bucket,
  ['s3-prefix']: s3Prefix,
  ['kms-key-id']: kmsKeyId,
  ['artifact-name']: artifactName,
} = argv;

const main = async () => {
  try {
    await packageTemplate(
      {
        templateFile,
        s3Bucket,
        s3Prefix,
        kmsKeyId,
        artifactName,
      },
      core
    );
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();
