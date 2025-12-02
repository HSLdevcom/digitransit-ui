export function subwayTransferUsesSameStation(prevLeg, nextLeg) {
  return (
    prevLeg?.mode === 'SUBWAY' &&
    nextLeg?.mode === 'SUBWAY' &&
    prevLeg.to.stop.parentStation?.gtfsId ===
      nextLeg.from.stop.parentStation?.gtfsId
  );
}
