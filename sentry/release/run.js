const exec = require('@actions/exec');
const core = require('@actions/core');

const { getReleaseVersion, getStartTimerKey } = require('.');

const { SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN } = process.env;

const main = async () => {
  try {
    const inputVersion = core.getInput('version');

    const sentryVersion = core.getInput('sentry-version');

    const environment = core.getInput('environment');

    const version = getReleaseVersion(SENTRY_PROJECT, inputVersion);

    core.setOutput('release', version);

    const sentryCli = `@sentry/cli@${sentryVersion}`;

    // sentry-cli releases new "$VERSION"
    await core.group(`Create a new release (${version})`, () =>
      exec.exec('npx', [sentryCli, 'releases', 'new', `"${version}"`])
    );

    // sentry-cli releases set-commits "$VERSION" --auto
    await core.group(`Attach commits to release`, () =>
      exec.exec('npx', [
        sentryCli,
        'releases',
        'set-commits',
        `"${version}"`,
        '--auto',
      ])
    );

    if (environment) {
      // track the start time in seconds for this deployment
      const startTime = Math.floor(+new Date() / 1000);

      const environmentKey = getStartTimerKey(SENTRY_ORG, SENTRY_PROJECT);

      core.exportVariable(environmentKey, startTime);
    }

    return true;
  } catch (error) {
    core.setFailed(error.message);
  }
};

if (!SENTRY_ORG) {
  throw new Error('"SENTRY_ORG" environment variable is not defined.');
}

if (!SENTRY_PROJECT) {
  throw new Error('"SENTRY_PROJECT" environment variable is not defined.');
}

if (!SENTRY_AUTH_TOKEN) {
  throw new Error('"SENTRY_AUTH_TOKEN" environment variable is not defined.');
}

main();
