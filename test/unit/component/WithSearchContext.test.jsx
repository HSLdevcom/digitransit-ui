import PropTypes from 'prop-types';
import { onTestFinished } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { withSearchContext } from '../../../app/component/WithSearchContext';
import { renderWithProviders } from '../helpers/mock-providers';

function Stub({ onSelect, item }) {
  return (
    <button type="button" onClick={() => onSelect(item, 'origin')}>
      select
    </button>
  );
}
Stub.propTypes = {
  onSelect: PropTypes.func.isRequired,
  item: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

function TwoChoiceStub({ onSelect, geolocationItem, manualItem }) {
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
  onSelect: PropTypes.func.isRequired,
  geolocationItem: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  manualItem: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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

describe('withSearchContext', () => {
  it('labels an embedded current location selection with a translated text', () => {
    const Component = withSearchContext(Stub, true);
    const selectHandler = vi.fn();
    renderWithProviders(
      <Component
        selectHandler={selectHandler}
        item={{ type: 'CurrentLocation' }}
      />,
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
    const Component = withSearchContext(Stub);
    const selectHandler = vi.fn();
    renderWithProviders(
      <Component
        selectHandler={selectHandler}
        item={{
          type: 'CurrentLocation',
          properties: { layer: 'currentPosition' },
        }}
      />,
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
    const Component = withSearchContext(TwoChoiceStub);
    const selectHandler = vi.fn();
    const manualItem = {
      type: 'Point',
      properties: { name: 'Manual address', label: 'Manual address' },
      geometry: { coordinates: [24.9, 60.2] },
    };
    renderWithProviders(
      <Component
        selectHandler={selectHandler}
        geolocationItem={{
          type: 'CurrentLocation',
          properties: { layer: 'currentPosition' },
        }}
        manualItem={manualItem}
      />,
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
});
