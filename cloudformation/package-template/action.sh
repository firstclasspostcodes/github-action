#!/bin/sh -l

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

node $DIR/dist/index.js "$@"