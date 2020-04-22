const path = require('path');
const fs = require('fs');

const artifact = require('@actions/artifact');
const CloudFormation = require('aws-sdk/clients/cloudformation');

const { AWS_REGION } = process.env;

const cloudformation = new CloudFormation({ region: AWS_REGION });

const getTemplateBody = async ({ filepath, artifactName }) => {
  if (artifact && filepath) {
    throw new Error(
      `Both filepath and artifact are set, choose one or the other.`
    );
  }

  let pathToFile = path.join(process.cwd(), filepath);

  if (artifactName) {
    const artifactClient = artifact.create();
    const sha = process.env.GITHUB_SHA;
    const { downloadPath } = await artifactClient.downloadArtifact(
      artifactName,
      process.cwd()
    );
    pathToFile = path.join(downloadPath, `${sha}.yml`);
  }

  if (!fs.existsSync(pathToFile)) {
    throw new Error(`The filepath "${pathToFile}" does not exist.`);
  }

  const body = fs.readFileSync(pathToFile, 'utf8');

  return body;
};

const getChangeSetType = async (stackName) => {
  let changeSetType = 'CREATE';

  const { Stacks: [stack] = [] } = await cloudformation
    .describeStacks({ StackName: stackName })
    .promise();

  if (stack) {
    changeSetType = 'UPDATE';
  }

  return changeSetType;
};

const getStackParameters = (json) => {
  if (typeof json === 'string') {
    try {
      return getStackParameters(JSON.parse(json));
    } catch (e) {
      throw new Error(`Parameters JSON: "${json}" was invalid JSON.`);
    }
  }

  const parameters = Object.entries(json).map(([key, value]) => {
    let parameterOptions = {
      ParameterValue: value,
    };

    if (typeof value === 'object') {
      parameterOptions = value;
    }

    return Object.assign({ ParameterKey: key }, parameterOptions);
  });

  return parameters;
};

const deleteChangeSet = async ({ stackName, changeSetName }) => {
  try {
    const changeSetParams = {
      StackName: stackName,
      ChangeSetName: changeSetName,
    };

    const data = await cloudformation
      .describeChangeSet(changeSetParams)
      .promise();

    if (data && typeof data.ChangeSetId === 'string') {
      await cloudformation.deleteChangeSet(changeSetParams).promise();
    }
  } catch (e) {
    console.log(`Changeset "${stackName}/${changeSetName}" does not exist.`);
  }

  return true;
};

const deployStack = async ({
  changeSetName,
  parameters,
  stackName,
  capabilities,
  templateFilePath,
  artifactName,
}) => {
  await deleteChangeSet({ stackName, changeSetName });

  const changeSetType = await getChangeSetType(stackName);

  const changeSetParams = {
    StackName: stackName,
    ChangeSetName: changeSetName,
    Capabilities: capabilities,
    ChangeSetType: changeSetType,
    Parameters: getStackParameters(parameters),
    TemplateBody: await getTemplateBody({
      artifactName,
      filepath: templateFilePath,
    }),
  };

  await cloudformation.createChangeSet(changeSetParams).promise();

  await cloudformation
    .waitFor('changeSetCreateComplete', {
      ChangeSetName: changeSetName,
    })
    .promise();

  await cloudformation
    .executeChangeSet({ StackName: stackName, ChangeSetName: changeSetName })
    .promise();

  let completionState = 'stackCreateComplete';

  if (changeSetType === 'UPDATE') {
    completionState = 'stackUpdateComplete';
  }

  await cloudformation
    .waitFor(completionState, { StackName: stackName })
    .promise();
};

module.exports = {
  deployStack,
};
