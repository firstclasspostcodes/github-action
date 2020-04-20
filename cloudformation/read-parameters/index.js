const core = require('@actions/core');
const github = require('@actions/github');

try {
  const pathPrefix = core.getInput('path');

  console.log(`Path Prefix is: ${pathPrefix}!`);
  // const time = (new Date()).toTimeString();
  // core.setOutput("time", time);

  // Get the JSON webhook payload for the event that triggered the workflow
  console.log(`The event payload: ${JSON.stringify(github.context.payload, '  ', 2)}`);
} catch (error) {
  core.setFailed(error.message);
}