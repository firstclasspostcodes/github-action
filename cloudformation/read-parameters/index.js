const core = require('@actions/core');
const github = require('@actions/github');
const SSM = require('aws-sdk/clients/ssm');

try {
  const pathPrefix = core.getInput('path');

  const region = process.env.AWS_REGION;



  console.log(`Path Prefix is: ${pathPrefix}!`);
  console.log(`region length is: ${region.length}`);
  // const time = (new Date()).toTimeString();
  // core.setOutput("time", time);

  // Get the JSON webhook payload for the event that triggered the workflow
  console.log(`The event payload: ${JSON.stringify(github.context.payload, '  ', 2)}`);
} catch (error) {
  core.setFailed(error.message);
}