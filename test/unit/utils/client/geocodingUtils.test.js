import fetchMock from 'fetch-mock';
import { reverseGeocode } from '../../../../utils/client/geocodingUtils';
import { createTestConfig } from '../../helpers/mock-context';

const GEOCODER_URL = 'https://geocoder.test/reverse';
const coords = { latitude: 60.1, longitude: 24.9 };

// Distinctive values, so the tests prove the request is built from config.
const createGeocoderConfig = (overrides = {}) => {
  const base = createTestConfig();
  return createTestConfig({
    language: 'sv',
    searchParams: {},
    URL: { ...base.URL, PELIAS_REVERSE_GEOCODER: GEOCODER_URL },
    ...overrides,
  });
};

describe('reverseGeocode', () => {
  // Scoped to the geocoder URL since fetch-mock is shared across files (isolate: false).
  const matcher = { url: `begin:${GEOCODER_URL}` };

  beforeAll(() => fetchMock.mockGlobal());

  afterEach(() => {
    fetchMock.removeRoutes();
    fetchMock.clearHistory();
  });

  afterAll(() => fetchMock.unmockGlobal());

  it('requests the geocoder from config with position, language and boundary country', async () => {
    fetchMock.get(matcher, { features: [] });

    await reverseGeocode(
      createGeocoderConfig({ searchParams: { 'boundary.country': 'FI' } }),
      coords,
    );

    const calls = fetchMock.callHistory.calls(matcher);
    expect(calls).toHaveLength(1);
    const url = new URL(calls[0].url);
    expect(`${url.origin}${url.pathname}`).toBe(GEOCODER_URL);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      'point.lat': '60.1',
      'point.lon': '24.9',
      lang: 'sv',
      size: '1',
      layers: 'address',
      'boundary.country': 'FI',
    });
  });

  it('omits boundary.country when it is not configured', async () => {
    fetchMock.get(matcher, { features: [] });

    await reverseGeocode(createGeocoderConfig(), coords);

    const url = new URL(fetchMock.callHistory.calls(matcher)[0].url);
    expect(url.searchParams.has('boundary.country')).toBe(false);
  });

  it('resolves to the address fields of the first feature only', async () => {
    fetchMock.get(matcher, {
      features: [
        {
          properties: {
            name: 'Mannerheimintie 1',
            gid: 'openaddresses:address:1',
            layer: 'address',
            locality: 'Helsinki',
          },
        },
        { properties: { name: 'Second', gid: 'second', layer: 'address' } },
      ],
    });

    await expect(
      reverseGeocode(createGeocoderConfig(), coords),
    ).resolves.toEqual({
      address: 'Mannerheimintie 1',
      gid: 'openaddresses:address:1',
      name: 'Mannerheimintie 1',
      layer: 'address',
      city: 'Helsinki',
    });
  });

  it('prefers localadmin over locality as the city', async () => {
    fetchMock.get(matcher, {
      features: [
        { properties: { name: 'A', localadmin: 'Espoo', locality: 'Tapiola' } },
      ],
    });

    const address = await reverseGeocode(createGeocoderConfig(), coords);

    expect(address.city).toBe('Espoo');
  });

  it('leaves the city undefined when the feature has no locality', async () => {
    fetchMock.get(matcher, {
      features: [{ properties: { name: 'A', gid: 'a', layer: 'address' } }],
    });

    const address = await reverseGeocode(createGeocoderConfig(), coords);

    expect(address.city).toBeUndefined();
  });

  it.each([
    ['no features are found', { features: [] }],
    ['the response has no features key', {}],
  ])('resolves to an empty object when %s', async (_, response) => {
    fetchMock.get(matcher, response);

    await expect(
      reverseGeocode(createGeocoderConfig(), coords),
    ).resolves.toEqual({});
  });

  it.each([
    ['the server responds with an error page', { status: 500, body: 'oops' }],
    ['the request fails', { throws: new TypeError('Failed to fetch') }],
  ])('rejects when %s', async (_, response) => {
    fetchMock.get(matcher, response);

    await expect(
      reverseGeocode(createGeocoderConfig(), coords),
    ).rejects.toBeDefined();
  });
});
