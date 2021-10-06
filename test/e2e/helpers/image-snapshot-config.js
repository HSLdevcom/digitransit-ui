const getConfig = (
  customSnapshotIdentifier,
  customSnapshotsDir,
  customDiffDir,
) => {
  return {
    diffDirection: 'vertical',
    dumpDiffToConsole: true,
    comparisonMethod: 'pixelmatch',
    failureThreshold: 0.025,
    failureThresholdType: 'percent',
    customSnapshotsDir,
    customDiffDir,
    customSnapshotIdentifier,
  };
};

export default getConfig;
