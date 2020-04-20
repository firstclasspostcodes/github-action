FROM node:12 as build

WORKDIR /build

COPY *.json /build/

RUN npm ci

RUN ls -l node_modules

COPY cloudformation /build/cloudformation

RUN npm run build

FROM node:12-alpine

RUN \
  apk update && \
  apk add jq git groff less python py-pip curl && \
  pip install awscli && \
  apk --purge -v del py-pip && \
  rm /var/cache/apk/*

COPY --from=build /build/cloudformation /command/cloudformation

ENTRYPOINT ["/bin/sh"]