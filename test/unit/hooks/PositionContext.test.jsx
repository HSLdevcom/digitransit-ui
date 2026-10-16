import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/mock-providers';
import {
  createInitialPositionState,
  positionReducer,
  usePosition,
  usePositionActions,
} from '../../../app/hooks/PositionContext';
import searchContext from '../../../app/data/SearchContext';

function PositionConsumer() {
  const position = usePosition();
  const { showGeolocationDeniedMessage } = usePositionActions();
  return (
    <>
      <output data-testid="position">
        {position.status}:{position.lat}:{position.lon}
      </output>
      <button type="button" onClick={showGeolocationDeniedMessage}>
        deny location
      </button>
    </>
  );
}

describe('PositionContext', () => {
  it('owns position state and bridges its latest value to SearchContext', () => {
    renderWithProviders(<PositionConsumer />);

    expect(screen.getByTestId('position').textContent).toBe('no-location:0:0');
    expect(searchContext.getPositions().status).toBe('no-location');

    fireEvent.click(screen.getByRole('button', { name: 'deny location' }));

    expect(screen.getByTestId('position').textContent).toBe(
      'geolocation-denied:0:0',
    );
    expect(searchContext.getPositions().status).toBe('geolocation-denied');
  });

  it('derives location flags and smooths nearby coordinates in the reducer', () => {
    let state = createInitialPositionState();
    state = positionReducer(state, {
      type: 'geolocation-found',
      location: { lat: 60.17, lon: 24.94, heading: 90 },
    });
    state = positionReducer(state, {
      type: 'geolocation-found',
      location: { lat: 60.1704, lon: 24.9404, heading: 0 },
    });

    expect(state.position).toMatchObject({
      lat: 60.1702,
      lon: 24.9402,
      locationCount: 2,
      hasLocation: true,
    });
    expect(state.fields.heading).toBe(90);

    state = positionReducer(state, { type: 'geolocation-denied' });
    expect(state.position.locationingFailed).toBe(true);
  });

  it('keeps state identity when an action changes nothing', () => {
    let state = positionReducer(createInitialPositionState(), {
      type: 'reverse-geocoding-started',
    });
    expect(positionReducer(state, { type: 'reverse-geocoding-started' })).toBe(
      state,
    );

    const address = { type: 'address-found', location: { address: 'Foo 1' } };
    state = positionReducer(state, address);
    expect(positionReducer(state, address)).toBe(state);
  });
});
