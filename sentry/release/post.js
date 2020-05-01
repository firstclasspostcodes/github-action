const exec = require('@actions/exec');
const core = require('@actions/core');
const io = require('@actions/io');
const { resolve: resolvePath } = require('path');

const { getReleaseVersion, getStartTimerKey } = require('.');

const { SENTRY_ORG, SENTRY_PROJECT } = process.env;

const main = async () => {
  const inputVersion = core.getInput('version');
  const environment = core.getInput('environment');
  const path = core.getInput('path');

  const sentryPath = await io.which('sentry-cli', true);

  if (!sentryPath) {
    throw new Error(`"sentry-cli" not found in $PATH`);
  }

  const version = getReleaseVersion(SENTRY_PROJECT, inputVersion);

  if (path) {
    const absoluteFilePath = resolvePath(process.cwd(), path);

    await core.group('Upload sourcemaps', async () => {
      // sentry-cli releases files VERSION upload-sourcemaps /path/to/sourcemaps --rewrite
      await exec.exec(`"${sentryPath}"`, [
        'releases',
        'files',
        `"${version}"`,
        'upload-sourcemaps',
        absoluteFilePath,
        '--rewrite',
      ]);

      // sentry-cli releases files VERSION list
      await exec.exec(`"${sentryPath}"`, [
        'releases',
        'files',
        `"${version}"`,
        'list',
      ]);

      return true;
    });
  }

  if (environment) {
    const starterKey = getStartTimerKey(SENTRY_ORG, SENTRY_PROJECT);
    const startTime = process.env[starterKey];
    const endTime = Math.floor(+new Date() / 1000);
    const timeTaken = endTime - startTime;

    // sentry-cli releases deploys VERSION new -e ENVIRONMENT -t $((now-start))
    await exec.exec(`"${sentryPath}"`, [
      'releases',
      'deploys',
      `"${version}"`,
      'new',
      '-e',
      environment,
      '-t',
      timeTaken,
    ]);
  }

  // sentry-cli releases finalize "$VERSION"
  await core.group(`Finalize the release (${version})`, () =>
    exec.exec(`"${sentryPath}"`, ['releases', 'finalize', `"${version}"`])
  );

  return true;
};

main();
