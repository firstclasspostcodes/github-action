const artifact = require('@actions/artifact');
const exec = require('@actions/exec');

const artifactClient = artifact.create();

const packageTemplate = async (
  { templateFile, s3Bucket, s3Prefix, kmsKeyId, artifactName },
  step
) => {
  step.startGroup(`Packaging template: ${templateFile}`);

  const sanitizedS3Preix = s3Prefix.replace(/(^\/|\/$)/g, '');

  const outputTemplateFilename = `___template.yml`;

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

  step.endGroup();

  return true;
};

module.exports = {
  packageTemplate,
};
