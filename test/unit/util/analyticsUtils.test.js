import {
  addAnalyticsEvent,
  getAnalyticsInitCode,
  initAnalyticsClientSide,
} from '../../../app/util/analyticsUtils';

describe('analytics utils', () => {
  describe('addAnalyticsEvent', () => {
    it('should add a new entry to window.dataLayer', () => {
      window.dataLayer = [];
      addAnalyticsEvent({ foo: 'bar' });
      const newSize = window.dataLayer.length;
      expect(newSize).to.equal(1);
    });

    it('should add correct event value when it is missing', () => {
      window.dataLayer = [];
      addAnalyticsEvent({ foo: 'bar' });
      const entry = window.dataLayer[0];
      expect(entry.event).to.equal('sendMatomoEvent');
    });

    it('should not replace existing event value', () => {
      window.dataLayer = [];
      addAnalyticsEvent({ event: 'testEvent' });
      const entry = window.dataLayer[0];
      expect(entry.event).to.equal('testEvent');
    });
  });
  describe('getAnalyticsInitCode', () => {
    it('should return a nonempty string when GTMid is given', () => {
      const res = getAnalyticsInitCode(1);
      expect(res.length > 0).to.equal(true);
    });
    it('should return an empty string when null GTMid is given', () => {
      const res = getAnalyticsInitCode(null);
      expect(res.length).to.equal(0);
    });
  });
  describe('initAnalyticsClientSide', () => {
    it('should initialize window.dataLayer to an array', () => {
      window.dataLayer = undefined;
      initAnalyticsClientSide();
      expect(Array.isArray(window.dataLayer)).to.equal(true);
    });
  });
});
