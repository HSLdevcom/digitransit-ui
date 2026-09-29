import {
  doMarkersOverlap,
  getArrowMarkerStyle,
  getSpeechBubbleStyle,
} from '../../../../../../app/component/map/non-tile-layer/TransitLegMarkers';

const box = (x1, y1, x2, y2) => ({
  topLeft: { x: x1, y: y1 },
  bottomRight: { x: x2, y: y2 },
});

describe('TransitLegMarkers', () => {
  describe('doMarkersOverlap', () => {
    it('should return false when there are no existing positions', () => {
      expect(doMarkersOverlap(box(0, 0, 10, 10), [])).to.equal(false);
    });

    it('should return false when boxes do not intersect horizontally', () => {
      const existing = [box(20, 0, 30, 10)];
      expect(doMarkersOverlap(box(0, 0, 10, 10), existing)).to.equal(false);
    });

    it('should return false when boxes do not intersect vertically', () => {
      const existing = [box(0, 20, 10, 30)];
      expect(doMarkersOverlap(box(0, 0, 10, 10), existing)).to.equal(false);
    });

    it('should return true when boxes overlap', () => {
      const existing = [box(5, 5, 15, 15)];
      expect(doMarkersOverlap(box(0, 0, 10, 10), existing)).to.equal(true);
    });
  });

  describe('getArrowMarkerStyle', () => {
    const baseLeg = () => ({
      topLeft: { x: 0, y: 0 },
      bottomRight: { x: 45, y: 15 },
      width: 45,
      height: 15,
    });

    it('should pick bottomLeft when there is nothing to overlap with', () => {
      expect(getArrowMarkerStyle(baseLeg(), []).style).to.equal('bottomLeft');
    });

    it('should fall back to bottomRight when bottomLeft overlaps', () => {
      const pixelPositions = [box(0, 0, 45, 15)];
      expect(getArrowMarkerStyle(baseLeg(), pixelPositions).style).to.equal(
        'bottomRight',
      );
    });
  });

  describe('getSpeechBubbleStyle', () => {
    const basePosition = () => ({
      topLeft: { x: 0, y: 0 },
      bottomRight: { x: 105, y: 30 },
      width: 105,
      height: 30,
    });

    it('should pick topRight when there is nothing to overlap with', () => {
      expect(getSpeechBubbleStyle(basePosition(), []).style).to.equal(
        'topRight',
      );
    });

    it('should fall back to topLeft when topRight overlaps', () => {
      const pixelPositions = [box(0, 0, 105, 30)];
      expect(
        getSpeechBubbleStyle(basePosition(), pixelPositions).style,
      ).to.equal('topLeft');
    });
  });
});
