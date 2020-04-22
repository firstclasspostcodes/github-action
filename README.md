# GitHub Action

This package helps us to integrate with AWS CloudFormation, using GitHub actions.

Below is an example of its usage, more to follow soon:

```yml
on:
  - push
  - pull_request

jobs:
  hello_world_job:
    runs-on: ubuntu-latest
    name: Test read parameters
    steps:
      - name: Test Read Parameters
        id: read-parameters
        uses: firstclasspostcodes/github-action/cloudformation/read-parameters@v1.0.4
        env:
          AWS_REGION: eu-west-1
        with:
          path: '/env/to/path'
```
