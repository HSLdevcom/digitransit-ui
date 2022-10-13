import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as timetables from '../../../app/configurations/timetableConfigUtils';

describe('timetableConfigUtils', () => {
  const baseTimetableURL = 'https://timetabletest.com/timetables/';
  describe('timetableUrlResolver', () => {
    it('should resolve URL correctly for HSL instance', () => {
      const timetableHandler = timetables.default.HSL;
      timetableHandler.setAvailableRouteTimetables({ 2550: '2550' });
      const route = { gtfsId: 'HSL:2550' };
      const url = timetableHandler.timetableUrlResolver(
        baseTimetableURL,
        route,
      );
      expect(url.href).to.equal(`${baseTimetableURL}2550.pdf`);
    });
    it('should resolve URL correctly for HSL instance with authentication param', () => {
      const timetableHandler = timetables.default.HSL;
      const route = { gtfsId: 'HSL:2550' };
      const url = timetableHandler.timetableUrlResolver(
        baseTimetableURL,
        route,
        'foo',
        'bar',
      );
      expect(url.href).to.equal(`${baseTimetableURL}2550.pdf?foo=bar`);
    });
    it('should resolve URL for bus lines correctly for tampere instance', () => {
      const timetableHandler = timetables.default.tampere;
      const route = { shortName: '11C', mode: 'BUS' };
      const url = timetableHandler.timetableUrlResolver(
        baseTimetableURL,
        route,
      );
      expect(url.href).to.equal(`${baseTimetableURL}11.html`);
    });
  });
  describe('stopPdfUrlResolver', () => {
    it('should resolve correctly for HSL instance', () => {
      const timetableHandler = timetables.default.HSL;
      const stop = { gtfsId: 'HSL:1122127' };
      const url = timetableHandler.stopPdfUrlResolver(baseTimetableURL, stop);
      expect(url.href).to.equal(`${baseTimetableURL}1122127.pdf`);
    });
    it('should resolve correctly for HSL instance with authentication param', () => {
      const timetableHandler = timetables.default.HSL;
      const stop = { gtfsId: 'HSL:1122127' };
      const url = timetableHandler.stopPdfUrlResolver(
        baseTimetableURL,
        stop,
        'foo',
        'bar',
      );
      expect(url.href).to.equal(`${baseTimetableURL}1122127.pdf?foo=bar`);
    });
    it('should resolve correctly for tampere instance', () => {
      const timetableHandler = timetables.default.tampere;
      const stop = { gtfsId: 'tampere:0053' };
      const url = timetableHandler.stopPdfUrlResolver(baseTimetableURL, stop);
      expect(url.href).to.equal(`${baseTimetableURL}53.pdf`);
    });
  });
});
