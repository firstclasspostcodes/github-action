const CloudFormation = require('aws-sdk/clients/cloudformation');

const { AWS_REGION } = process.env;

const cloudformation = new CloudFormation({ region: AWS_REGION });

const doesStackExist = async (stackName) => {
  const {
    Stacks: [stack],
  } = cloudformation.describeStacks({ StackName: stackName }).promise();

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

  const tableData = StackEvents.map((event) => {
    const {
      LogicalResourceId,
      ResourceType,
      Timestamp,
      ResourceStatus,
      ResourceStatusReason,
    } = event;

    return {
      Id: LogicalResourceId,
      Type: ResourceType,
      Time: Timestamp,
      Status: ResourceStatus,
      Reason: ResourceStatusReason,
    };
  });

  console.table(tableData);
};

module.exports = {
  listStackEvents,
};
