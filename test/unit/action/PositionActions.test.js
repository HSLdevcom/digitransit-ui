import fetchMock from 'fetch-mock';
import {
  initPositionActions,
  showGeolocationDeniedMessage,
  startLocationWatch,
  stopLocationWatch,
} from '../../../app/action/PositionActions';
import { messageActions } from '../../../app/hooks/MessageContext';
import { geolocationMessages } from '../../../utils/client/geolocationMessages';
import { createTestConfig } from '../helpers/mock-context';

const GEOCODER_URL = 'https://geocoder.test/reverse';

const createGeocoderConfig = (overrides = {}) => {
  const base = createTestConfig();
  return createTestConfig({
    language: 'sv',
    searchParams: {},
    URL: { ...base.URL, PELIAS_REVERSE_GEOCODER: GEOCODER_URL },
    ...overrides,
  });
};

const validCoords = { latitude: 60.1, longitude: 24.9, heading: 0 };

const createActionContext = () => {
  const actionContext = {
    dispatch: vi.fn(),
    getStore: vi.fn(),
    executeAction: vi.fn((action, payload) => action(actionContext, payload)),
  };
  return actionContext;
};

const stubNavigator = (name, value) =>
  Object.defineProperty(navigator, name, { value, configurable: true });

// Starts the location watch; the stub reports the first position immediately.
// jsdom has no navigator.permissions, so the watch starts without a permission query.
// Returns a function that reports further positions.
const startWatchWithPosition = (actionContext, coords = validCoords) => {
  let onPosition;
  stubNavigator('geolocation', {
    watchPosition: vi.fn(onSuccess => {
      onPosition = onSuccess;
      onSuccess({ coords });
      return 1;
    }),
    clearWatch: vi.fn(),
  });
  startLocationWatch(actionContext);
  return nextCoords => onPosition({ coords: nextCoords });
};

const addressFoundPayloads = actionContext =>
  actionContext.dispatch.mock.calls
    .filter(([type]) => type === 'AddressFound')
    .map(([, payload]) => payload);

describe('PositionActions', () => {
  describe('showGeolocationDeniedMessage', () => {
    it('posts the denied message and marks other geolocation messages read via messageActions', () => {
      // Geolocation permission/timeout messages can't be posted through
      // useMessageActions() since PositionActions is a plain Fluxible
      // action module, not a React component/hook. It must go through the
      // messageActions bridge exported by MessageContext instead of the
      // legacy actionContext.dispatch('AddMessage'/'MarkMessageAsRead', ...)
      // calls, which no longer have any listener now that the Flux
      // MessageStore has been replaced by MessageContext.
      const addMessage = vi.spyOn(messageActions, 'addMessage');
      const markMessageAsRead = vi.spyOn(messageActions, 'markMessageAsRead');
      const actionContext = { dispatch: vi.fn() };

      showGeolocationDeniedMessage(actionContext);

      expect(
        addMessage.mock.calls.some(
          call => call[0] === geolocationMessages.denied,
        ),
      ).toBe(true);
      Object.keys(geolocationMessages)
        .filter(id => id !== 'denied')
        .forEach(id => {
          expect(
            markMessageAsRead.mock.calls.some(
              call => call[0] === geolocationMessages[id].id,
            ),
          ).toBe(true);
        });
    });
  });

  describe('reverse geocoding of a found position', () => {
    // One continuous fake clock, so the module-level reverse geocoding debounce sees
    // monotonic time across tests.
    beforeAll(() => {
      fetchMock.mockGlobal();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.advanceTimersByTime(10001);
      stopLocationWatch();
      delete navigator.geolocation;
      fetchMock.removeRoutes();
      fetchMock.clearHistory();
    });

    afterAll(() => {
      // Module-level config is shared with other files in the worker.
      initPositionActions(undefined);
      vi.useRealTimers();
      fetchMock.unmockGlobal();
    });

    const geocode = async (config, response) => {
      // Scoped to the geocoder URL since fetch-mock is shared across files (isolate: false).
      const matcher = { url: `begin:${GEOCODER_URL}` };
      fetchMock.get(matcher, response);
      initPositionActions(config);
      const actionContext = createActionContext();
      startWatchWithPosition(actionContext);
      await vi.waitFor(() =>
        expect(addressFoundPayloads(actionContext)).toHaveLength(1),
      );
      return { actionContext, calls: fetchMock.callHistory.calls(matcher) };
    };

    it('geocodes with the config given to initPositionActions', async () => {
      const { calls } = await geocode(createGeocoderConfig(), {
        features: [],
      });

      expect(calls).toHaveLength(1);
      const url = new URL(calls[0].url);
      expect(`${url.origin}${url.pathname}`).toBe(GEOCODER_URL);
      expect(Object.fromEntries(url.searchParams)).toMatchObject({
        'point.lat': '60.1',
        'point.lon': '24.9',
        lang: 'sv',
      });
    });

    it('dispatches the geocoded address as AddressFound', async () => {
      const { actionContext } = await geocode(createGeocoderConfig(), {
        features: [
          {
            properties: {
              name: 'Mannerheimintie 1',
              gid: 'openaddresses:address:1',
              layer: 'address',
              locality: 'Helsinki',
            },
          },
        ],
      });

      expect(addressFoundPayloads(actionContext)).toEqual([
        {
          address: 'Mannerheimintie 1',
          gid: 'openaddresses:address:1',
          name: 'Mannerheimintie 1',
          layer: 'address',
          city: 'Helsinki',
        },
      ]);
    });

    it.each([
      ['no features are found', { features: [] }],
      ['the response has no features key', {}],
      ['the server responds with an error page', { status: 500, body: 'oops' }],
      ['the request fails', { throws: new TypeError('Failed to fetch') }],
    ])('dispatches an empty AddressFound when %s', async (_, response) => {
      const { actionContext, calls } = await geocode(
        createGeocoderConfig(),
        response,
      );

      expect(calls).toHaveLength(1);
      expect(addressFoundPayloads(actionContext)).toEqual([{}]);
    });

    it('geocodes at most once per 10 s and then once more for the latest position', async () => {
      const matcher = { url: `begin:${GEOCODER_URL}` };
      fetchMock.get(matcher, { features: [] });
      initPositionActions(createGeocoderConfig());
      const actionContext = createActionContext();
      const reportPosition = startWatchWithPosition(actionContext);
      await vi.waitFor(() =>
        expect(fetchMock.callHistory.calls(matcher)).toHaveLength(1),
      );

      reportPosition({ ...validCoords, latitude: 60.2 });
      reportPosition({ ...validCoords, latitude: 60.3 });
      expect(fetchMock.callHistory.calls(matcher)).toHaveLength(1);

      vi.advanceTimersByTime(10000);
      await vi.waitFor(() =>
        expect(fetchMock.callHistory.calls(matcher)).toHaveLength(2),
      );
      const latestUrl = new URL(fetchMock.callHistory.calls(matcher)[1].url);
      expect(latestUrl.searchParams.get('point.lat')).toBe('60.3');
    });

    it('dispatches the search start and the found position before the address', async () => {
      const { actionContext } = await geocode(createGeocoderConfig(), {
        features: [],
      });

      const types = actionContext.dispatch.mock.calls.map(([type]) => type);
      expect(types.indexOf('StartReverseGeocoding')).toBeGreaterThan(-1);
      expect(types.indexOf('StartReverseGeocoding')).toBeLessThan(
        types.indexOf('GeolocationFound'),
      );
      expect(types.indexOf('GeolocationFound')).toBeLessThan(
        types.indexOf('AddressFound'),
      );
      expect(actionContext.dispatch).toHaveBeenCalledWith('GeolocationFound', {
        lat: 60.1,
        lon: 24.9,
        heading: 0,
      });
    });

    it.each([
      ['NaN latitude', { ...validCoords, latitude: NaN }],
      ['undefined latitude', { ...validCoords, latitude: undefined }],
      ['NaN longitude', { ...validCoords, longitude: NaN }],
      ['undefined longitude', { ...validCoords, longitude: undefined }],
    ])('ignores a position with %s', async (_, coords) => {
      const matcher = { url: `begin:${GEOCODER_URL}` };
      fetchMock.get(matcher, { features: [] });
      initPositionActions(createGeocoderConfig());
      const actionContext = createActionContext();

      startWatchWithPosition(actionContext, coords);
      await vi.advanceTimersByTimeAsync(0);

      expect(navigator.geolocation.watchPosition).toHaveBeenCalledTimes(1);
      const types = actionContext.dispatch.mock.calls.map(([type]) => type);
      expect(types).not.toContain('GeolocationFound');
      expect(types).not.toContain('StartReverseGeocoding');
      expect(fetchMock.callHistory.calls(matcher)).toHaveLength(0);
    });

    it('fails with a clear error when initPositionActions was not called', async () => {
      initPositionActions(undefined);
      const errors = [];
      const actionContext = createActionContext();
      actionContext.executeAction = vi.fn((action, payload) => {
        try {
          action(actionContext, payload);
        } catch (error) {
          errors.push(error);
        }
      });

      startWatchWithPosition(actionContext);
      await vi.advanceTimersByTimeAsync(0);

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(/initPositionActions/);
    });
  });
});
