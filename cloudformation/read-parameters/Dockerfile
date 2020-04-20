FROM node:12

USER root

RUN apt-get update && \
  apt-get install -y \
  python3 \
  python3-pip \
  python3-setuptools && \
  pip3 install --upgrade pip && \
  apt-get clean

RUN pip3 --no-cache-dir install --upgrade awscli

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /entrypoint.sh

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/entrypoint.sh"]