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
});
