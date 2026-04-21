/**
 * Boolean value determining if any dev environment flag is active
 * RUN_ENV='development' is set in digitransit-kubernetes-deploy for Kubernetes dev instances.
 * Setting NODE_ENV to a specific value determines how the local environment behaves.
 * NODE_ENV can be set to test, development, and production.
 *
 * ***IMPORTANT! Sometimes it is desireable to only use NODE_ENV for setting a local dev configuration.
 * This variable should mainly be used as a config dev flag.***
 */
export const IS_DEV =
  process.env.RUN_ENV === 'development' ||
  process.env.NODE_ENV !== 'production';
