# syntax = docker/dockerfile:1.27.0

#================================================================================
# builder stage
#================================================================================
FROM node:24.14.1-alpine AS builder

WORKDIR /opt/digitransit-ui

ENV \
  # Stops tools from treating this as a dev environment, and Nx from writing a local .nx cache.
  CI=true \
  NODE_ENV=production

# Install from the manifests only, so this layer is reused until a dependency changes.
COPY .yarnrc.yml package.json yarn.lock lerna.json ./
COPY .yarn ./.yarn
COPY --parents packages/*/*/package.json ./
RUN yarn install --immutable --inline-builds

# Build the packages before copying the rest of the repo, so changes elsewhere don't rebuild them.
COPY packages ./packages
RUN yarn run packages-build

# A non-empty CONFIG builds assets for that config only: faster, but the image then serves only it.
# Declared after the package build, so changing a build arg doesn't invalidate that layer.
ARG CONFIG=''
ARG WEBPACK_DEVTOOL=''
COPY . .
RUN \
  yarn run build \
  && rm -rf node_modules/.cache /tmp/Relay*

# Keep production dependencies only, and remove build-only tooling, packages/private and static/
# (already copied to _static/). Done in this stage, because files deleted in the runtime stage would
# still be in the copied layer.
RUN \
  yarn workspaces focus --all --production \
  && yarn cache clean --all \
  && rm -rf .yarn .yarnrc.yml yarn.lock lerna.json nx.json packages/private node_modules/@digitransit-ui static


#================================================================================
# runtime stage
#================================================================================
FROM node:24.14.1-alpine AS runtime
LABEL org.opencontainers.image.title="digitransit-ui"
LABEL org.opencontainers.image.description="open nationwide journey planning platform"
LABEL org.opencontainers.image.authors="digitransit@hsl.fi"
LABEL org.opencontainers.image.documentation="https://digitransit.fi"
LABEL org.opencontainers.image.source="https://github.com/HSLdevcom/digitransit-ui/tree/v3"
LABEL org.opencontainers.image.licenses="(AGPL-3.0 OR EUPL-1.2)"

WORKDIR /opt/digitransit-ui

EXPOSE 8080

COPY --from=builder /opt/digitransit-ui/ .

ARG CONFIG=''
ENV \
  PORT=8080 \
  API_URL='' \
  MAP_URL='' \
  OTP_URL='' \
  GEOCODING_BASE_URL='' \
  CONFIG=${CONFIG} \
  NODE_ENV=production \
  RUN_ENV='' \
  # Non-empty, because an empty value kept the server from starting https://github.com/HSLdevcom/digitransit-ui/issues/4155
  # --title only sets process.title
  NODE_OPTS=--title=digitransit-ui \
  ASSET_URL='' \
  STATIC_MESSAGE_URL=''

HEALTHCHECK \
  --interval=5s --timeout=3s --retries=3 --start-period=5s \
  CMD wget --spider -q "http://localhost:${PORT}/" || exit 1

CMD ["sh", "-c", "exec node ${NODE_OPTS} src/server/server.js"]
