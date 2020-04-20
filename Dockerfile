FROM node:12-alpine

RUN \
  apk update && \
  apk add git groff less python py-pip curl && \
  pip install awscli && \
  apk --purge -v del py-pip && \
  rm /var/cache/apk/*

ADD . /command

ENTRYPOINT ["/bin/sh"]