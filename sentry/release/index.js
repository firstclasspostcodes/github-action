exports.getReleaseVersion = (project, version) => {
  const releaseVersion = version.replace(/^.*refs(\/([a-z]+)\/)?/, '');
  return `${project.toLowerCase()}-${releaseVersion}`;
};

exports.getStartTimerKey = (org, project) =>
  `${org}_${project}_SENTRY_DEPLOY_START`.toUpperCase();
