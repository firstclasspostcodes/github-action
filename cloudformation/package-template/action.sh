#!/bin/sh -l

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "dir is: $DIR";

# node $DIR/dist/index.js "$@"

node /command/cloudformation/package-template/dist/index.js $@