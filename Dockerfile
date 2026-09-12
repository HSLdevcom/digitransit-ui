# syntax = docker/dockerfile:1.4
FROM node:24.14.1-alpine as builder

WORKDIR /opt/digitransit-ui

ENV \
  # We mimick common CI/CD systems so that tools don't assume a "normal" dev env.
  # Also makes Lerna (via Nx) skip local build caching, so it never writes `.nx`.
  CI=true \
  # Picked up by various Node.js tools.
  NODE_ENV=production

COPY .yarnrc.yml package.json yarn.lock lerna.json ./
COPY .yarn ./.yarn

# todo: only copy */packages/*/package.json, not all of the code
# AFAIK there is no blob syntax that copies */package.json while keeping paths.
# https://github.com/moby/moby/issues/15858
COPY digitransit-util ./digitransit-util
COPY digitransit-search-util ./digitransit-search-util
COPY digitransit-component ./digitransit-component
COPY digitransit-store ./digitransit-store

RUN \
  # Tell Playwright not to download browser binaries, as it is only used for testing (not building).
  # https://github.com/microsoft/playwright/blob/v1.16.2/installation-tests/installation-tests.sh#L200-L216
  export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
  && yarn install --immutable --inline-builds

# Deliberately scoped to config/schema (rather than folded into the `COPY . .` +
# `yarn run build` step below): this keeps the RUN below cacheable by Docker's
# layer cache whenever only app/server files change (the common case), instead
# of invalidating (and re-running all 16 workspace-package builds) on *any*
# file change in the repo.
COPY config ./config
COPY schema ./schema
RUN \
  yarn run workspace-packages-build

# Setting $CONFIG causes digitransit-ui to only build assets for *one* instance (see app/configurations).
# This speeds up the build (because favicons-webpack-plugin is increasingly *very* slow with the nr of
# configs processed), but the resulting image won't be able to serve other instances. Declared here
# (only read by webpack.config.js below, not by the workspace-package build above) rather than
# earlier, so that building for a different CONFIG doesn't needlessly invalidate that step's cache too.
ARG CONFIG=''
ENV CONFIG=${CONFIG}
COPY . .
RUN \
  yarn run build \
  && rm -rf node_modules/.cache \
  && rm -rf /tmp/Relay*

# Prune node_modules down to production-only dependencies across every workspace
# (root + digitransit-component/store/search-util/util packages) *before* the
# final stage's `COPY --from=builder` below, not after: a later `RUN` in the
# final stage can only add a whiteout for deleted files - the full unpruned
# tree would still be baked into the `COPY` layer itself and still count
# against the final image's real (pushed/pulled) size. Doing it here, using
# the cache this stage's own `yarn install` already warmed (no network
# access needed), means the final stage only ever copies the already-small
# tree.
#
# Once this finishes, nothing later needs Yarn/Lerna/Nx again (the final image
# doesn't invoke any of them - see its CMD), so their toolchain/config files
# are removed here too, alongside the build-only rollup/babel/relay-schema
# config (only read by `yarn run workspace-packages-build` above) and `static`
# (source assets consumed by CopyWebpackPlugin, see webpack.config.js, already
# copied into `_static` by the build above).
RUN \
  yarn workspaces focus --all --production \
  && yarn cache clean --all \
  && rm -rf .yarn .yarnrc.yml yarn.lock lerna.json nx.json config schema static

FROM node:24.14.1-alpine
LABEL org.opencontainers.image.title="digitransit-ui"
LABEL org.opencontainers.image.description="open nationwide journey planning platform"
LABEL org.opencontainers.image.authors="digitransit@hsl.fi"
LABEL org.opencontainers.image.documentation="https://digitransit.fi"
LABEL org.opencontainers.image.source="https://github.com/HSLdevcom/digitransit-ui/tree/v3"
LABEL org.opencontainers.image.revision="3"
LABEL org.opencontainers.image.licenses="(AGPL-3.0 OR EUPL-1.2)"

WORKDIR /opt/digitransit-ui

EXPOSE 8080

COPY --from=builder /opt/digitransit-ui/ .

ARG CONFIG=''
ARG WEBPACK_DEVTOOL=''
ENV \
  # App specific settings to override when the image is run \
  PORT=8080 \
  API_URL='' \
  MAP_URL='' \
  OTP_URL='' \
  GEOCODING_BASE_URL='' \
  CONFIG=$CONFIG \
  NODE_ENV='' \
  RUN_ENV='' \
  # setting a non-empty default value for NODE_OPTS
  # if you don't do this then yarn/node seem to think that you want to
  # execute a file called "" (empty string) and doesn't start the server
  # https://github.com/HSLdevcom/digitransit-ui/issues/4155
  #
  # the --title option just sets the harmless property process.title
  # https://nodejs.org/api/cli.html#cli_title_title
  NODE_OPTS='--title=digitransit-ui' \
  WEBPACK_DEVTOOL=$WEBPACK_DEVTOOL \
  ASSET_URL='' \
  STATIC_MESSAGE_URL=''

RUN apk add --no-cache curl
HEALTHCHECK \
  --interval=5s --timeout=3s --retries=3 --start-period=5s \
  CMD curl -fsSLI "http://localhost:$PORT/" || exit 1

CMD yarn run start
