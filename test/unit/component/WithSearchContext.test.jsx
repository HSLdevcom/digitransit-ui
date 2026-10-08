import React from 'react';
import PropTypes from 'prop-types';
import { onTestFinished } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import { withSearchContext } from '../../../app/component/WithSearchContext';
import searchContext from '../../../app/data/SearchContext';
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

// Stub exposing two separate selections for the same ('origin') field, so a
// test can trigger a geolocation lookup and then pick a different, manual
// location for that field before the lookup resolves.
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

// Minimal PositionStore whose change listener can be fired from the test
const createPositionStore = () => {
  let listener;
  let locationState = { type: 'CurrentLocation', status: 'no-location' };
  return {
    on: (event, cb) => {
      listener = cb;
    },
    removeListener: () => {},
    getLocationState: () => locationState,
    emit: newState => {
      locationState = newState;
      act(() => listener());
    },
  };
};

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

  it('selects the current location once positioning resolves', () => {
    // SearchContext is only initialized by the client bootstrap
    const startLocationWatch = () => {};
    const original = searchContext.startLocationWatch;
    searchContext.startLocationWatch = startLocationWatch;
    onTestFinished(() => {
      searchContext.startLocationWatch = original;
    });
    const Component = withSearchContext(Stub);
    const selectHandler = vi.fn();
    const executeAction = vi.fn();
    const positionStore = createPositionStore();
    renderWithProviders(
      <Component
        selectHandler={selectHandler}
        item={{
          type: 'CurrentLocation',
          properties: { layer: 'currentPosition' },
        }}
      />,
      { executeAction, getStore: () => positionStore },
    );

    fireEvent.click(screen.getByRole('button'));
    expect(executeAction).toHaveBeenCalledWith(startLocationWatch);
    expect(selectHandler).not.toHaveBeenCalled();

    const found = {
      type: 'CurrentLocation',
      status: 'found-address',
      lat: 60.17,
      lon: 24.94,
      address: 'Kamppi',
    };
    positionStore.emit(found);

    expect(selectHandler).toHaveBeenCalledTimes(1);
    expect(selectHandler).toHaveBeenCalledWith(found, 'origin');
  });

  it('does not let a late geolocation result overwrite a location manually picked for the same field in the meantime', () => {
    const startLocationWatch = () => {};
    const original = searchContext.startLocationWatch;
    searchContext.startLocationWatch = startLocationWatch;
    onTestFinished(() => {
      searchContext.startLocationWatch = original;
    });
    const Component = withSearchContext(TwoChoiceStub);
    const selectHandler = vi.fn();
    const executeAction = vi.fn();
    const positionStore = createPositionStore();
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
      { executeAction, getStore: () => positionStore },
    );

    // Start a geolocation lookup for origin.
    fireEvent.click(screen.getByText('use current location'));
    expect(executeAction).toHaveBeenCalledWith(startLocationWatch);
    expect(selectHandler).not.toHaveBeenCalled();

    // Before it resolves, the user picks a different origin manually.
    fireEvent.click(screen.getByText('select manual address'));
    expect(selectHandler).toHaveBeenCalledTimes(1);
    expect(selectHandler).toHaveBeenLastCalledWith(
      expect.objectContaining({ address: 'Manual address' }),
      'origin',
    );

    // The original geolocation lookup resolves afterwards.
    const found = {
      type: 'CurrentLocation',
      status: 'found-address',
      lat: 60.17,
      lon: 24.94,
      address: 'Kamppi',
    };
    positionStore.emit(found);

    // It must not overwrite the manually picked origin.
    expect(selectHandler).toHaveBeenCalledTimes(1);
  });
});
