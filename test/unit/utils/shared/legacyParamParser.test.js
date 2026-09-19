import { expect } from 'chai';
import { describe, it } from 'mocha';
import { DateTime } from 'luxon';
import legacyParamParser from '../../../../utils/shared/legacyParamParser';
import defaultConfig from '../../../../server/configs/config.default';
import { PREFIX_ITINERARY_SUMMARY } from '../../../../utils/shared/path';

// legacyParamParser also supports free-text from/to, resolved via a real
// geocoding network call - out of scope here, these tests stick to the
// fully deterministic legacy `*label*kkjX*kkjY*` coordinate format and the
// no-input fallback, neither of which touch the network.
const config = { ...defaultConfig, queryMaxAgeDays: 30 };

const from = 'Rautatientori*Rautatientori*3386000*6672000';
const to = 'Pasila*Pasila*3385000*6674000';
const encodedFromTo =
  'Rautatientori%3A%3A59.22055697195946%2C39.60512691605255/Pasila%3A%3A59.23992292960779%2C39.596351606316105';

describe('legacyParamParser', () => {
  it('builds an itinerary summary redirect from legacy KKJ-coordinate from/to params', async () => {
    const url = await legacyParamParser({ from, to }, config);
    expect(url).to.equal(`/${PREFIX_ITINERARY_SUMMARY}/${encodedFromTo}/`);
  });

  it('appends a "time" param when a recent daymonthyear/hour/minute is given', async () => {
    const now = DateTime.now().setZone(config.timeZone);
    const daymonthyear = `${now.day}.${now.month}.${now.year}`;

    const url = await legacyParamParser(
      { from, to, daymonthyear, hour: '10', minute: '30' },
      config,
    );

    expect(url).to.match(
      new RegExp(
        `^/${PREFIX_ITINERARY_SUMMARY}/${encodedFromTo}/\\?time=\\d+$`,
      ),
    );
  });

  it('appends "arriveBy=true" when timetype is "arrival"', async () => {
    const now = DateTime.now().setZone(config.timeZone);
    const daymonthyear = `${now.day}.${now.month}.${now.year}`;

    const url = await legacyParamParser(
      {
        from,
        to,
        daymonthyear,
        hour: '10',
        minute: '30',
        timetype: 'arrival',
      },
      config,
    );

    expect(url).to.match(
      new RegExp(
        `^/${PREFIX_ITINERARY_SUMMARY}/${encodedFromTo}/\\?time=\\d+&arriveBy=true$`,
      ),
    );
  });

  it('falls back to the index-page redirect format when from/to are both missing', async () => {
    const url = await legacyParamParser({}, config);
    expect(url).to.equal('/%20/%20/');
  });
});
