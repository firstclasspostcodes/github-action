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

const listStackEvents = async ({ stackName }, step) => {
  const isDeployed = await doesStackExist(stackName);

  if (!isDeployed) {
    step.debug(`Stack "${stackName}" does not exist. Exiting.`);
    return true;
  }

  const params = {
    StackName: stackName,
  };

  const { StackEvents } = await cloudformation
    .describeStackEvents(params)
    .promise();

  const tableKeys = [
    'LogicalResourceId',
    'ResourceType',
    'Timestamp',
    'ResourceStatus',
    'ResourceStatusReason',
  ];

  console.table(StackEvents, tableKeys);
};

module.exports = {
  listStackEvents,
};
