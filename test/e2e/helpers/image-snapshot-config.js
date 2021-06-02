const getConfig = (
  customSnapshotIdentifier,
  customSnapshotsDir,
  customDiffDir,
) => {
  return {
    diffDirection: 'vertical',
    // useful on CI (no need to retrieve the diff image, copy/paste image content from logs)
    dumpDiffToConsole: false,
    comparisonMethod: 'pixelmatch',
    failureThreshold: 0.01,
    failureThresholdType: 'percent',
    customSnapshotsDir,
    customDiffDir,
    customSnapshotIdentifier,
  };
};

export default getConfig;
