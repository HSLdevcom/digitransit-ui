import { DateTime } from 'luxon';
import legacyParamParser from '../../../../utils/shared/legacyParamParser';
import defaultConfig from '../../../../server/configs/config.default';
import { PREFIX_ITINERARY_SUMMARY } from '../../../../utils/shared/path';

// Free-text from/to (`from_in`/`to_in`) are resolved via geocoding - mocked
// here so no test touches the network.
const { getGeocodingResults } = vi.hoisted(() => ({
  getGeocodingResults: vi.fn(),
}));
vi.mock('@digitransit-util/digitransit-util', async importOriginal => ({
  ...(await importOriginal()),
  getGeocodingResults,
}));

const config = { ...defaultConfig, queryMaxAgeDays: 30 };

const from = 'Rautatientori*Rautatientori*3386000*6672000';
const to = 'Pasila*Pasila*3385000*6674000';
const encodedFromTo =
  'Rautatientori%3A%3A59.22055697195946%2C39.60512691605255/Pasila%3A%3A59.23992292960779%2C39.596351606316105';

describe('legacyParamParser', () => {
  it('builds an itinerary summary redirect from legacy KKJ-coordinate from/to params', async () => {
    const url = await legacyParamParser({ from, to }, config);
    expect(url).toBe(`/${PREFIX_ITINERARY_SUMMARY}/${encodedFromTo}/`);
  });

  it('appends a "time" param when a recent daymonthyear/hour/minute is given', async () => {
    const now = DateTime.now().setZone(config.timeZone);
    const daymonthyear = `${now.day}.${now.month}.${now.year}`;

    const url = await legacyParamParser(
      { from, to, daymonthyear, hour: '10', minute: '30' },
      config,
    );

    expect(url).toMatch(
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

    expect(url).toMatch(
      new RegExp(
        `^/${PREFIX_ITINERARY_SUMMARY}/${encodedFromTo}/\\?time=\\d+&arriveBy=true$`,
      ),
    );
  });

  it('falls back to the index-page redirect format when from/to are both missing', async () => {
    const url = await legacyParamParser({}, config);
    expect(url).toBe('/%20/%20/');
  });

  it('geocodes free-text from_in/to_in against the configured Pelias URL', async () => {
    getGeocodingResults.mockImplementation(text =>
      Promise.resolve([
        {
          properties: { label: text },
          geometry: { coordinates: [24.9, 60.2] },
        },
      ]),
    );

    const url = await legacyParamParser(
      { from_in: 'Pasila', to_in: 'Kamppi' },
      config,
    );

    expect(getGeocodingResults).toHaveBeenCalledWith(
      'Pasila',
      config.searchParams,
      null,
      null,
      null,
      config.URL.PELIAS,
      config.search?.minimalRegexp ?? null,
    );
    expect(url).toBe(
      `/${PREFIX_ITINERARY_SUMMARY}/Pasila%3A%3A60.2%2C24.9/Kamppi%3A%3A60.2%2C24.9/`,
    );
  });
});
