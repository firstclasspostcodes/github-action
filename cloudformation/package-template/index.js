const minimist = require('minimist');
const io = require('@actions/io');
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

    await exec.exec('aws', [
      'cloudformation',
      'package',
      '--template-file',
      templateFile,
      '--s3-bucket',
      s3Bucket,
      '--s3-prefix',
      s3Prefix,
      '--kms-key-id',
      kmsKeyId,
      '--output-template-file',
      'template.yml',
    ]);

    await artifactClient.uploadArtifact(
      artifactName,
      ['template.yml'],
      process.cwd()
    );

    await io.rmRF('template.yml');
  } catch (error) {
    core.setFailed(error.message);
  }
};

main(minimist(process.argv.slice(2)));
