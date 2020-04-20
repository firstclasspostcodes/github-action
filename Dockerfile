FROM node:12 as build

WORKDIR /build

ADD . /build

RUN npm ci && \
    npx lerna bootstrap

RUN npm run build

FROM node:12-alpine

RUN \
  apk update && \
  apk add jq git groff less python py-pip curl && \
  pip install awscli && \
  apk --purge -v del py-pip && \
  rm /var/cache/apk/*

COPY --from=build /build /command

ENTRYPOINT ["/bin/sh"]