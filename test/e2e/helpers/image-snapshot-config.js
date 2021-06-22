const getConfig = (
  customSnapshotIdentifier,
  customSnapshotsDir,
  customDiffDir,
) => {
  return {
    diffDirection: 'vertical',
    dumpDiffToConsole: true,
    comparisonMethod: 'pixelmatch',
    failureThreshold: 0.01,
    failureThresholdType: 'percent',
    customSnapshotsDir,
    customDiffDir,
    customSnapshotIdentifier,
  };
};

export default getConfig;
