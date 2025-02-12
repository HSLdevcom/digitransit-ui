import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as timetables from '../../../app/configurations/timetableConfigUtils';

describe('timetableConfigUtils', () => {
  describe('routeTimetableUrlResolver', () => {
    it('should resolve URL correctly for HSL instance', () => {
      const baseTimetableURL = 'https://timetabletest.com/?foo=bar';
      const timetableHandler = timetables.default.HSL;
      const route = { gtfsId: 'HSL:2550' };
      const url = timetableHandler.routeTimetableUrlResolver(
        baseTimetableURL,
        route,
        '20231031',
        'en',
      );
      expect(url.href).to.equal(
        `${baseTimetableURL}&props%5BshowPrintButton%5D=true&props%5Bredirect%5D=false&props%5BlineId%5D=2550&props%5BdateBegin%5D=2023-10-31&props%5BdateEnd%5D=2023-10-31&props%5Blang%5D=en`,
      );
    });
    it('should resolve URL for bus lines correctly for tampere instance', () => {
      const baseTimetableURL = 'https://timetabletest.com/timetables/';
      const timetableHandler = timetables.default.tampere;
      const route = { shortName: '11C', mode: 'BUS' };
      const url = timetableHandler.routeTimetableUrlResolver(
        baseTimetableURL,
        route,
        '20231031',
        'en',
      );
      expect(url.href).to.equal(`${baseTimetableURL}11.html`);
    });
  });
  describe('stopTimetableUrlResolver', () => {
    it('should resolve correctly for HSL instance', () => {
      const hslStopTimetableURL = 'https://timetabletest.com/?foo=bar';
      const timetableHandler = timetables.default.HSL;
      const stop = { gtfsId: 'HSL:1122127' };
      const date = '20231031';
      const lang = 'en';
      const url = timetableHandler.stopTimetableUrlResolver(
        hslStopTimetableURL,
        stop,
        date,
        lang,
      );
      expect(url.href).to.equal(
        `${hslStopTimetableURL}&props%5BisSummerTimetable%5D=false&props%5BprintTimetablesAsA4%5D=true&props%5BprintTimetablesAsGreyscale%5D=false&props%5Btemplate%5D=default&props%5BshowAddressInfo%5D=false&props%5BshowPrintButton%5D=true&props%5Bredirect%5D=false&template=default&props%5BstopId%5D=1122127&props%5Bdate%5D=2023-10-31&props%5Blang%5D=en`,
      );
    });
    it('should resolve correctly for tampere instance', () => {
      const baseTimetableURL = 'https://timetabletest.com/timetables/';
      const timetableHandler = timetables.default.tampere;
      const stop = { gtfsId: 'tampere:0053' };
      const url = timetableHandler.stopTimetableUrlResolver(
        baseTimetableURL,
        stop,
      );
      expect(url.href).to.equal(`${baseTimetableURL}53.pdf`);
    });
  });
});
