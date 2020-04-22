const core = require('@actions/core');
const artifact = require('@actions/artifact');
const exec = require('@actions/exec');

const artifactClient = artifact.create();

const packageTemplate = async ({
  templateFile,
  s3Bucket,
  s3Prefix,
  kmsKeyId,
  artifactName,
}) => {
  try {
    const sanitizedS3Preix = s3Prefix.replace(/(^\/|\/$)/g, '');

    const outputTemplateFilename = `${process.env.GITHUB_SHA}.yml`;

    await exec.exec('aws', [
      'cloudformation',
      'package',
      '--template-file',
      templateFile,
      '--s3-bucket',
      s3Bucket,
      '--s3-prefix',
      sanitizedS3Preix,
      '--kms-key-id',
      kmsKeyId,
      '--output-template-file',
      outputTemplateFilename,
    ]);

    await artifactClient.uploadArtifact(
      artifactName,
      [outputTemplateFilename],
      process.cwd()
    );

    return true;
  } catch (error) {
    core.setFailed(error.message);
  }
};

module.exports = {
  packageTemplate,
};
