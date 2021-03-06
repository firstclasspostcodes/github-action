const CloudFormation = require('aws-sdk/clients/cloudformation');

const { AWS_REGION } = process.env;

const cloudformation = new CloudFormation({ region: AWS_REGION });

const doesStackExist = async (stackName) => {
  try {
    await cloudformation.describeStacks({ StackName: stackName }).promise();
    return true;
  } catch (err) {
    return false;
  }
};

const deleteStack = async ({ stackName }, step) => {
  step.startGroup(`Deleting stack: ${stackName}`);

  const isDeployed = await doesStackExist(stackName);

  if (!isDeployed) {
    step.debug(`Stack "${stackName}" does not exist. Exiting.`);
    return true;
  }

  const stackDeleteParams = {
    StackName: stackName,
  };

  await cloudformation.deleteStack(stackDeleteParams).promise();

  await cloudformation
    .waitFor('stackDeleteComplete', stackDeleteParams)
    .promise();

  step.debug(`Stack "${stackName}" has been deleted.`);

  step.endGroup();
};

module.exports = {
  deleteStack,
};
