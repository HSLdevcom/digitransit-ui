import PropTypes from 'prop-types';
import { onTestFinished } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import getJson from '@digitransit-search-util/digitransit-search-util-get-json';
import {
  SearchProvider,
  useSearchContext,
} from '../../../app/hooks/SearchContext';
import searchContext from '../../../app/data/SearchContext';
import { removeSearch, saveSearch } from '../../../app/data/SearchHistory';
import { SEARCH_PATH_OPTS } from '../../../utils/client/searchUtils';
import { renderWithProviders } from '../helpers/mock-providers';

vi.mock('@digitransit-search-util/digitransit-search-util-get-json', () => ({
  default: vi.fn(),
}));
vi.mock('../../../app/data/SearchContext', () => ({
  default: {
    getRoutesByIds: vi.fn(),
    setPositionGetter: vi.fn(),
  },
}));
vi.mock('../../../app/data/SearchHistory', () => ({
  removeSearch: vi.fn(),
  saveSearch: vi.fn(),
}));

const suggestionShape = PropTypes.shape({
  type: PropTypes.string.isRequired,
  properties: PropTypes.shape({
    name: PropTypes.string,
    layer: PropTypes.string,
    gtfsId: PropTypes.string,
    gid: PropTypes.string,
    label: PropTypes.string,
  }),
  geometry: PropTypes.shape({
    coordinates: PropTypes.arrayOf(PropTypes.number),
  }),
});

function Stub({ item, id = 'origin', label = 'select' }) {
  const { onSelect } = useSearchContext();
  return (
    <button type="button" onClick={() => onSelect(item, id)}>
      {label}
    </button>
  );
}
Stub.propTypes = {
  item: suggestionShape.isRequired,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
};

function TwoChoiceStub({ geolocationItem, manualItem }) {
  const { onSelect } = useSearchContext();
  return (
    <>
      <button type="button" onClick={() => onSelect(geolocationItem, 'origin')}>
        use current location
      </button>
      <button type="button" onClick={() => onSelect(manualItem, 'origin')}>
        select manual address
      </button>
    </>
  );
}
TwoChoiceStub.propTypes = {
  geolocationItem: suggestionShape.isRequired,
  manualItem: suggestionShape.isRequired,
};

function mockGeolocation() {
  let positionCallback;
  const permissionsDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'permissions',
  );
  const geolocationDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'geolocation',
  );
  const watchPosition = vi.fn(callback => {
    positionCallback = callback;
    return 1;
  });

  Object.defineProperty(navigator, 'permissions', {
    configurable: true,
    value: {
      query: vi.fn().mockResolvedValue({ state: 'prompt' }),
    },
  });
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      watchPosition,
      clearWatch: vi.fn(),
    },
  });
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: () => ({
        features: [
          {
            properties: {
              name: 'Kamppi',
              gid: 'address-id',
              layer: 'address',
              localadmin: 'Helsinki',
            },
          },
        ],
      }),
    }),
  );
  onTestFinished(() => {
    if (permissionsDescriptor) {
      Object.defineProperty(navigator, 'permissions', permissionsDescriptor);
    } else {
      delete navigator.permissions;
    }
    if (geolocationDescriptor) {
      Object.defineProperty(navigator, 'geolocation', geolocationDescriptor);
    } else {
      delete navigator.geolocation;
    }
    vi.unstubAllGlobals();
  });

  return {
    watchPosition,
    emitPosition: async () => {
      await act(async () => {
        positionCallback({
          coords: { latitude: 60.17, longitude: 24.94 },
        });
        await Promise.resolve();
        await Promise.resolve();
      });
    },
  };
}

describe('SearchProvider', () => {
  beforeEach(() => {
    saveSearch.mockClear();
    removeSearch.mockClear();
    getJson.mockReset();
    searchContext.getRoutesByIds.mockReset();
  });

  it('labels an embedded current location selection with a translated text', () => {
    const selectHandler = vi.fn();
    renderWithProviders(
      <SearchProvider selectHandler={selectHandler} embeddedSearch>
        <Stub item={{ type: 'CurrentLocation' }} />
      </SearchProvider>,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(selectHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'CurrentLocation',
        address: 'Your current location',
      }),
      'origin',
    );
  });

  it('selects the current location once positioning resolves', async () => {
    const { watchPosition, emitPosition } = mockGeolocation();
    const selectHandler = vi.fn();
    renderWithProviders(
      <SearchProvider selectHandler={selectHandler}>
        <Stub
          item={{
            type: 'CurrentLocation',
            properties: { layer: 'currentPosition' },
          }}
        />
      </SearchProvider>,
    );

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(watchPosition).toHaveBeenCalledTimes(1));
    expect(selectHandler).not.toHaveBeenCalled();

    await emitPosition();
    await waitFor(() =>
      expect(selectHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'found-address',
          lat: 60.17,
          lon: 24.94,
          address: 'Kamppi, Helsinki',
        }),
        'origin',
      ),
    );
  });

  it('does not let a late geolocation result overwrite a manual selection', async () => {
    const { watchPosition, emitPosition } = mockGeolocation();
    const selectHandler = vi.fn();
    const manualItem = {
      type: 'Point',
      properties: { name: 'Manual address', label: 'Manual address' },
      geometry: { coordinates: [24.9, 60.2] },
    };
    renderWithProviders(
      <SearchProvider selectHandler={selectHandler}>
        <TwoChoiceStub
          geolocationItem={{
            type: 'CurrentLocation',
            properties: { layer: 'currentPosition' },
          }}
          manualItem={manualItem}
        />
      </SearchProvider>,
    );

    fireEvent.click(screen.getByText('use current location'));
    await waitFor(() => expect(watchPosition).toHaveBeenCalledTimes(1));
    expect(selectHandler).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('select manual address'));
    expect(selectHandler).toHaveBeenCalledTimes(1);
    expect(selectHandler).toHaveBeenLastCalledWith(
      expect.objectContaining({ address: 'Manual address' }),
      'origin',
    );

    await emitPosition();
    expect(selectHandler).toHaveBeenCalledTimes(1);
  });

  it('keeps pending selections and embedded behavior local to each search', async () => {
    const { watchPosition, emitPosition } = mockGeolocation();
    const selectHandler = vi.fn();
    const embeddedSelectHandler = vi.fn();
    const onGeolocationStart = vi.fn();
    const item = {
      type: 'CurrentLocation',
      properties: { layer: 'currentPosition' },
    };
    renderWithProviders(
      <>
        <SearchProvider
          selectHandler={selectHandler}
          onGeolocationStart={onGeolocationStart}
        >
          <Stub item={item} label="regular" />
        </SearchProvider>
        <SearchProvider selectHandler={embeddedSelectHandler} embeddedSearch>
          <Stub item={item} label="embedded" />
        </SearchProvider>
      </>,
    );

    fireEvent.click(screen.getByText('regular'));
    await waitFor(() => expect(watchPosition).toHaveBeenCalledTimes(1));
    expect(onGeolocationStart).toHaveBeenCalledWith(item, 'origin');
    fireEvent.click(screen.getByText('embedded'));
    expect(embeddedSelectHandler).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'no-location' }),
      'origin',
    );
    expect(selectHandler).not.toHaveBeenCalled();

    await emitPosition();
    await waitFor(() =>
      expect(selectHandler).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'found-address' }),
        'origin',
      ),
    );
    expect(embeddedSelectHandler).toHaveBeenCalledTimes(1);
  });

  it('resolves pending geolocation for via-point ID zero', async () => {
    const { watchPosition, emitPosition } = mockGeolocation();
    const selectHandler = vi.fn();
    renderWithProviders(
      <SearchProvider selectHandler={selectHandler}>
        <Stub
          id={0}
          item={{
            type: 'CurrentLocation',
            properties: { layer: 'currentPosition' },
          }}
        />
      </SearchProvider>,
    );

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(watchPosition).toHaveBeenCalledTimes(1));
    await emitPosition();
    await waitFor(() =>
      expect(selectHandler).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'found-address' }),
        0,
      ),
    );
  });

  it('discards pending geolocation when the search unmounts', async () => {
    const { watchPosition, emitPosition } = mockGeolocation();
    const selectHandler = vi.fn();
    const { rerender } = renderWithProviders(
      <SearchProvider selectHandler={selectHandler}>
        <Stub
          item={{
            type: 'CurrentLocation',
            properties: { layer: 'currentPosition' },
          }}
        />
      </SearchProvider>,
    );

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(watchPosition).toHaveBeenCalledTimes(1));
    rerender(<span>search removed</span>);
    await emitPosition();
    expect(selectHandler).not.toHaveBeenCalled();
  });

  it.each([
    ['Route', 'stop-route-station', 'search', true],
    ['FutureRoute', 'origin', null, true],
    ['FavouritePlace', 'origin', null, false],
    ['Point', 'favourite', null, false],
    ['Point', 'origin', 'endpoint', false],
  ])(
    'preserves selection and history handling for %s in %s',
    (type, id, historyType, passThrough) => {
      const selectHandler = vi.fn();
      const item = {
        type,
        properties: { name: 'Place', label: 'Place' },
        geometry: { coordinates: [24.9, 60.2] },
      };
      renderWithProviders(
        <SearchProvider selectHandler={selectHandler}>
          <Stub item={item} id={id} />
        </SearchProvider>,
      );

      fireEvent.click(screen.getByRole('button'));

      if (historyType) {
        expect(saveSearch).toHaveBeenCalledWith({ item, type: historyType });
      } else {
        expect(saveSearch).not.toHaveBeenCalled();
      }
      if (passThrough) {
        expect(selectHandler.mock.calls[0][0]).toBe(item);
      } else {
        expect(selectHandler).toHaveBeenCalledWith(
          expect.objectContaining({ address: 'Place', lat: 60.2, lon: 24.9 }),
          id,
        );
      }
    },
  );

  it.each(['refreshed', 'removed', 'failed'])(
    'handles a %s saved route',
    async outcome => {
      const selectHandler = vi.fn();
      const item = {
        type: 'OldSearch',
        properties: { layer: 'route-BUS', gtfsId: 'HSL:1', name: 'Old route' },
      };
      const route = {
        type: 'Route',
        properties: { layer: 'route-BUS', gtfsId: 'HSL:1', name: 'New route' },
      };
      if (outcome === 'failed') {
        searchContext.getRoutesByIds.mockRejectedValue(new Error('offline'));
      } else {
        searchContext.getRoutesByIds.mockResolvedValue(
          outcome === 'refreshed' ? [route] : [],
        );
      }
      renderWithProviders(
        <SearchProvider selectHandler={selectHandler}>
          <Stub item={item} id="stop-route-station" />
        </SearchProvider>,
      );

      fireEvent.click(screen.getByRole('button'));
      await waitFor(() => expect(selectHandler).toHaveBeenCalledTimes(1));
      expect(searchContext.getRoutesByIds).toHaveBeenCalledWith(
        ['HSL:1'],
        SEARCH_PATH_OPTS,
      );
      const selected =
        outcome === 'refreshed' ? { ...item, ...route, type: item.type } : item;
      expect(selectHandler).toHaveBeenCalledWith(
        selected,
        'stop-route-station',
      );
      if (outcome === 'removed') {
        expect(removeSearch).toHaveBeenCalledWith({ item, type: 'search' });
        expect(saveSearch).not.toHaveBeenCalled();
      } else {
        expect(saveSearch).toHaveBeenCalledWith({
          item: selected,
          type: 'search',
        });
        expect(removeSearch).not.toHaveBeenCalled();
      }
    },
  );

  it.each(['refreshed', 'changed', 'failed'])(
    'handles a %s saved address',
    async outcome => {
      const selectHandler = vi.fn();
      const item = {
        type: 'OldSearch',
        properties: { gid: 'address-id', name: 'Place', label: 'Place' },
        geometry: { coordinates: [24.9, 60.2] },
      };
      if (outcome === 'failed') {
        getJson.mockRejectedValue(new Error('offline'));
      } else {
        getJson.mockResolvedValue({
          features: [
            {
              properties: {
                name: outcome === 'changed' ? 'Renamed place' : 'Place',
              },
              geometry: { coordinates: [25, 61] },
            },
          ],
        });
      }
      renderWithProviders(
        <SearchProvider selectHandler={selectHandler}>
          <Stub item={item} />
        </SearchProvider>,
      );

      fireEvent.click(screen.getByRole('button'));
      await waitFor(() => expect(selectHandler).toHaveBeenCalledTimes(1));
      expect(getJson).toHaveBeenCalledWith(expect.any(String), {
        ids: 'address-id',
      });
      expect(selectHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          address: 'Place',
          lat: outcome === 'failed' ? 60.2 : 61,
          lon: outcome === 'failed' ? 24.9 : 25,
        }),
        'origin',
      );
      if (outcome === 'changed') {
        expect(removeSearch).toHaveBeenCalledWith({ item, type: 'endpoint' });
        expect(saveSearch).not.toHaveBeenCalled();
      } else {
        expect(saveSearch).toHaveBeenCalledWith({ item, type: 'endpoint' });
        expect(removeSearch).not.toHaveBeenCalled();
      }
    },
  );
});
