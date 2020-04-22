const CloudFormation = require('aws-sdk/clients/cloudformation');

const { AWS_REGION } = process.env;

const cloudformation = new CloudFormation({ region: AWS_REGION });

const doesStackExist = async (stackName) => {
  const { Stacks: [stack] = [] } = await cloudformation
    .describeStacks({ StackName: stackName })
    .promise();

  if (stack) {
    return true;
  }

  return false;
};

const deleteStack = async ({ stackName }, step) => {
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
};

module.exports = {
  deleteStack,
};
