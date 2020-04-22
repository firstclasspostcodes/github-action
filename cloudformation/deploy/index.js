const path = require('path');
const fs = require('fs');

const artifact = require('@actions/artifact');
const CloudFormation = require('aws-sdk/clients/cloudformation');

const { AWS_REGION } = process.env;

const cloudformation = new CloudFormation({ region: AWS_REGION });

const getTemplateBody = async ({ filepath, artifactName }) => {
  if (artifactName && filepath) {
    throw new Error(
      `Both filepath and artifact are set, choose one or the other.`
    );
  }

  let pathToFile;

  if (filepath) {
    pathToFile = path.resolve(process.cwd(), filepath);
  }

  if (artifactName) {
    const artifactClient = artifact.create();
    const { downloadPath } = await artifactClient.downloadArtifact(
      artifactName,
      process.cwd()
    );
    pathToFile = path.join(downloadPath, `___template.yml`);
  }

  if (!fs.existsSync(pathToFile)) {
    throw new Error(`The filepath "${pathToFile}" does not exist.`);
  }

  const body = fs.readFileSync(pathToFile, 'utf8');

  return body;
};

const getChangeSetType = async (stackName) => {
  let changeSetType = 'CREATE';

  try {
    const { Stacks: [stack] = [] } = await cloudformation
      .describeStacks({ StackName: stackName })
      .promise();

    if (stack.StackStatus !== 'REVIEW_IN_PROGRESS') {
      changeSetType = 'UPDATE';
    }
  } catch (err) {
    console.log(`Stack "${stackName} does not exist. Creating.`);
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

const deployStack = async (
  {
    changeSetName,
    parameters,
    stackName,
    capabilities,
    templateFilePath,
    artifactName,
  },
  step
) => {
  await step.group('Deleting existing changeset', () =>
    deleteChangeSet({ stackName, changeSetName })
  );

  const changeSetType = await getChangeSetType(stackName);

  const templateBody = await step.group('Retrieving packaged template', () =>
    getTemplateBody({
      artifactName,
      filepath: templateFilePath,
    })
  );

  step.startGroup(`Creating ChangeSet on stack: ${stackName}`);

  const changeSetParams = {
    StackName: stackName,
    ChangeSetName: changeSetName,
    Capabilities: capabilities,
    ChangeSetType: changeSetType,
    Parameters: getStackParameters(parameters),
    TemplateBody: templateBody,
  };

  await cloudformation.createChangeSet(changeSetParams).promise();

  const stackAndChangeSetName = {
    StackName: stackName,
    ChangeSetName: changeSetName,
  };

  try {
    await cloudformation
      .waitFor('changeSetCreateComplete', stackAndChangeSetName)
      .promise();
  } catch (err) {
    const { StatusReason: reason } = await cloudformation
      .describeChangeSet(stackAndChangeSetName)
      .promise();

    step.debug(`Change Set Failed: "${reason}"`);

    if (/no updates/i.test(reason)) {
      return true;
    }
  }

  step.endGroup();

  step.startGroup(`Executing ChangeSet on stack: ${stackName}`);

  await cloudformation.executeChangeSet(stackAndChangeSetName).promise();

  let completionState = 'stackCreateComplete';

  if (changeSetType === 'UPDATE') {
    completionState = 'stackUpdateComplete';
  }

  await cloudformation
    .waitFor(completionState, { StackName: stackName })
    .promise();

  step.endGroup();
};

module.exports = {
  deployStack,
};
