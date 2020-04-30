# GitHub Action

The actions in this repository, help us to deploy with AWS CloudFormation & integrate with our AWS environment, using GitHub actions. 

Included actions help you to:

* Package AWS templates `aws cloudformation package`.
* Create/Update AWS CloudFormation stacks.
* Delete AWS CloudFormation stacks.
* Read stack outputs and output them as step outputs.
* Read SSM Parameter Store parameters and output them as step outputs.
* Trigger workflows when certain AWS EventBridge / CloudWatch events are triggered.

Below is an example of its usage:

```yml
name: Deploy

on:
  - push
  # Start this workflow when a repository dispatch event is received
  # that matches this type. 
  # 
  # Configuring this trigger is demonstrated below, in the `clouformation/triggers` action.
  - repository_dispatch:
      types: [my-parameter-trigger]

jobs:
  deploy:
    name: Deploy my service
    runs-on: ubuntu-latest

    strategy:
      matrix:
        # Set a matrix to deploy to multiple regions in parallel.
        region: [eu-west-1, us-east-1]

    env:
      # You will need to set required AWS credentials as environment variables.
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      AWS_REGION: ${{ matrix.region }}
      
    steps:
      # Using the CloudFormation triggers action enables you to start your workflow,
      # when certain AWS EventBridge or AWS CloudWatch events are triggered inside
      # your AWS account.
      # 
      # This action works by deploying an AWS CloudFormation stack that matches the
      # repository name, suffixed with the name property you provide. This allows
      # you to deploy multiple triggers that start different workflows, if necessary.
      # The CloudFormation stack deploys a pre-configured AWS Lambda function that
      # is triggered from the configured EventBridge/CloudWatch event pattern.
      # 
      # Note: For this action to work, you will need to configure a repo scoped
      # GitHub personal access token and set it as a secret. In the example below,
      # we've used "AWS_TRIGGER_TOKEN", which is a GitHub personal access token.
      - name: 'cloudformation/triggers'
        uses: firstclasspostcodes/github-action/cloudformation/triggers@v2.1.2
        with:
          # Required: set a unique name for the created CloudFormation stack.
          name: my-parameter-trigger-rule
          # Required: Pass a GitHub token with repo scope. This CANNOT be the token
          # that has been created for this workflow execution.
          token: ${{ secrets.AWS_TRIGGER_TOKEN }}
          # Required: Set the type (name) of the event that will be dispatched to
          # the repository.
          event-type: my-parameter-trigger
          # Required: Configure the event matching pattern that will be used to
          # trigger repository event dispatches.
          # 
          # See: https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/CloudWatchEventsandEventPatterns.html
          event-pattern: |
            {
              "source": ["aws.ssm"],
              "detail": {
                "operation": ["Update"],
                "name": ["/Test/Path/Parameter/FakeName"]
              }
            }

      # This action uses the command-line action `aws clouformation package` and uploads
      # the output template file to an workflow artifact.
      # 
      # For more information about what this action does, see:
      # 
      # https://docs.aws.amazon.com/cli/latest/reference/cloudformation/package.html
      - name: 'cloudforation/package-template'
        uses: firstclasspostcodes/github-action/cloudformation/package-template@v2.1.2
        with:
          # Required: Pass a relative filepath to the template, from the root of the repository.
          template-file: ./examples/template.yml
          # Required: The name of an AWS S3 Bucket that packaged resources will be
          # uploaded to. 
          s3-bucket: packaged-resources-s3-bucket-name
          # Optional: The S3 key prefix that resources will be uploaded under.
          s3-prefix: s3-key-prefix
          # Optional: If required, you can also pass a KMS Key ID for artifacts
          # to be uploaded with.
          kms-key-id: 3456-cdsw2-tyhjnbv-q2345tyhbvcx
          # Required: The name of the artifact to be uploaded.
          artifact-name: example-artifact-name

      # Use this action to deploy a CloudFormation template directly from the repository
      # or from a packaged artifact name. 
      # 
      # Stacks are deployed using `create-change-set` and `execute-change-set`, stacks
      # will either be created, or updated if they already exist. If no updates are to
      # be performed, this action will exit successfully and has no effect.
      - name: 'cloudformation/deploy'
        uses: firstclasspostcodes/github-action/cloudformation/deploy@v2.1.2
        with:
          # Optional: Pass through a valid JSON object for required parameters.
          # 
          # Parameters can either be a string, or an object (as demonstrated below).
          # 
          # If you need to pass an object, see the "Parameters" definition here;
          # https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html#createChangeSet-property
          parameters: |
            {
              "SimpleParameterExample": "this-is-a-test-value",
              "PreviousExampleValue": {
                "UsePreviousValue": true
              }
            }
          # Optional: Pass through a valid JSON object of tags.
          # 
          # Tags added to CloudFormation stacks are also added to supported resources
          # that are deployed by the stack. Passing through the ref and sha helps you to
          # diagnose issues with releases.
          tags: |
            {
              "Release": "${{ github.ref }}",
              "SHA": "${{ github.sha }}"
            }
          # Optional: A comma-delimited list of capabilities that the deployment requires.
          # The default value is set to the example value.
          capabilities: 'CAPABILITY_IAM,CAPABILITY_AUTO_EXPAND'
          # Required: Set the name the CloudFormation stack that will be deployed.
          stack-name: example-test-stack
          # Mutually exclusive: Pass a relative filepath to the template, from the root of the repository. You must provide either "template-file" OR "artifact-name", not both.
          template-file: ./examples/template.yml
          # Mutually exclusive: The name of the artifact to be downloaded and the template
          # from inside it deployed. The template must be named: "___template.yml"
          artifact-name: example-artifact-name

      # The `cloudformation/run` action packages your CloudFormation template, deploys it and
      # reads the stack outputs as step outputs, all in one handy action.
      # 
      # The packaged template is also uploaded as a workflow artifact.
      - name: 'cloudformation/run'
        id: stack
        uses: firstclasspostcodes/github-action/cloudformation/run@v2.1.2
        with:
          # Optional: Pass through a valid JSON object for required parameters.
          # 
          # Parameters can either be a string, or an object (as demonstrated below).
          # 
          # If you need to pass an object, see the "Parameters" definition here;
          # https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html#createChangeSet-property
          parameters: |
            {
              "SimpleParameterExample": "this-is-a-test-value",
              "PreviousExampleValue": {
                "UsePreviousValue": true
              }
            }
          # Optional: Pass through a valid JSON object of tags.
          # 
          # Tags added to CloudFormation stacks are also added to supported resources
          # that are deployed by the stack. Passing through the ref and sha helps you to
          # diagnose issues with releases.
          tags: |
            {
              "Release": "${{ github.ref }}",
              "SHA": "${{ github.sha }}"
            }
          # Required: Set the name the CloudFormation stack that will be deployed.
          stack-name: example-test-stack
          # Required: Pass a relative filepath to the template, from the root of the repository.
          template-file: ./examples/template.yml
          # Required: The name of an AWS S3 Bucket that packaged resources will be
          # uploaded to. 
          s3-bucket: packaged-resources-s3-bucket-name
          # Optional: The S3 key prefix that resources will be uploaded under.
          s3-prefix: s3-key-prefix
          # Required: The name of the artifact to be uploaded.
          artifact-name: example-artifact-name

      # In the case of a deployment failure, you can use this action to retrieve
      # and display a list of stack events. The retrieved stack events should include
      # the reason why the deployment failed, this information is displayed in the console
      # using Node's `console.table` function.
      - name: 'cloudformation/errors'
        if: failure()
        uses: firstclasspostcodes/github-action/cloudformation/errors@v2.1.2
        with:
          # Required: Provide the name of the stack to list errors for.
          stack-name: example-test-stack

      # This action allows you to read the values of parameters that are stored in AWS SSM Parameter Store.
      # 
      # This is useful for build processes that may require parameter values, etc.
      # 
      # You provide a parameter name prefix and all the parameters under this prefix are read
      # and their values included as step outputs. The names of parameters are snake-cased 
      # so that they're compatible with GitHub action syntax.
      # 
      # For example, given a parameter named: /Master/Production/DatabaseName, this would
      # be output as "master-production-database-name".
      - name: 'cloudformation/read-parameters'
        id: parameters
        uses: firstclasspostcodes/github-action/cloudformation/read-parameters@v2.1.2
        with:
          # Required: The SSM Parameter Store path prefix
          path: "/Master/Production"

      # This example follows on from the step above, describing how you can use these
      # parameters in subsequent job steps:
      - name: Echo Parameter Output from "cloudformation/read-parameters"
        run: echo $PARAMETER_VALUE
        env:
          PARAMETER_VALUE: ${{ steps.parameters.outputs.master-production-database-name }}

      # Delete a CloudFormation stack. If the stack does not exist, then this action
      # has no effect. 
      - name: 'cloudformation/delete'
        uses: firstclasspostcodes/github-action/cloudformation/delete@v2.1.2
        with:
          # Required: The name of the CloudFormation stack to delete.
          stack-name: example-test-stack
```
