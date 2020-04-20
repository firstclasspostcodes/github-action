const minimist = require('minimist');
const core = require('@actions/core');
const artifact = require('@actions/artifact');
const exec = require('@actions/exec');

const artifactClient = artifact.create();

const main = async (argv) => {
  try {
    const {
      ['template-file']: templateFile,
      ['s3-bucket']: s3Bucket,
      ['s3-prefix']: s3Prefix,
      ['kms-key-id']: kmsKeyId,
      ['artifact-name']: artifactName,
    } = argv;

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

main(minimist(process.argv.slice(2)));
