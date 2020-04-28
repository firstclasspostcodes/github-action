const core = require('@actions/core');

const { packageTemplate } = require('.');

const { AWS_REGION } = process.env;

const main = async () => {
  try {
    const packageParams = {
      s3Bucket: core.getInput('s3-bucket'),
      s3Prefix: core.getInput('s3-prefix'),
      kmsKeyId: core.getInput('kms-key-id'),
      templateFile: core.getInput('template-file'),
      artifactName: core.getInput('artifact-name'),
    };

    await packageTemplate(packageParams, core);

    return true;
  } catch (error) {
    core.setFailed(error.message);
  }
};

if (!AWS_REGION) {
  throw new Error('"AWS_REGION" environment variable is not defined.');
}

main();
