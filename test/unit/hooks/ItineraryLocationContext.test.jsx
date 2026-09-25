import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import {
  ItineraryLocationProvider,
  useOrigin,
  useDestination,
  useViaPoints,
  useItineraryLocationActions,
} from '../../../app/hooks/ItineraryLocationContext';

/**
 * A test consumer component that exposes the current context values via a
 * ref so tests can inspect them without reading implementation internals.
 */
const LocationConsumer = ({ controlRef }) => {
  const origin = useOrigin();
  const destination = useDestination();
  const viaPoints = useViaPoints();
  const actions = useItineraryLocationActions();

  useEffect(() => {
    if (controlRef) {
      const ref = controlRef;
      ref.current = { origin, destination, viaPoints, actions };
    }
  });

  return <div />;
};

LocationConsumer.propTypes = {
  controlRef: PropTypes.shape({ current: PropTypes.object }),
};

describe('ItineraryLocationContext', () => {
  let unmount;
  let controlRef;

  afterEach(() => {
    if (unmount) {
      unmount();
      unmount = null;
    }
  });

  const setup = () => {
    controlRef = { current: null };
    const result = render(
      <ItineraryLocationProvider>
        <LocationConsumer controlRef={controlRef} />
      </ItineraryLocationProvider>,
    );
    unmount = result.unmount;
  };

  it('starts with empty origin, destination and via points', () => {
    setup();
    expect(controlRef.current.origin).toEqual({});
    expect(controlRef.current.destination).toEqual({});
    expect(controlRef.current.viaPoints).toEqual([]);
  });

  it('updates the origin via setOrigin', () => {
    setup();
    act(() => {
      controlRef.current.actions.setOrigin({ lat: 1, lon: 2 });
    });
    expect(controlRef.current.origin).toEqual({ lat: 1, lon: 2 });
  });

  it('updates the destination via setDestination', () => {
    setup();
    act(() => {
      controlRef.current.actions.setDestination({ lat: 3, lon: 4 });
    });
    expect(controlRef.current.destination).toEqual({ lat: 3, lon: 4 });
  });

  it('replaces via points via setViaPoints', () => {
    setup();
    const points = [
      { lat: 1, lon: 1 },
      { lat: 2, lon: 2 },
    ];
    act(() => {
      controlRef.current.actions.setViaPoints(points);
    });
    expect(controlRef.current.viaPoints).toEqual(points);
  });

  it('removes a matching via point via deleteViaPoint', () => {
    setup();
    const points = [
      { lat: 1, lon: 1 },
      { lat: 2, lon: 2 },
    ];
    act(() => {
      controlRef.current.actions.setViaPoints(points);
    });
    act(() => {
      controlRef.current.actions.deleteViaPoint({ lat: 1, lon: 1 });
    });
    expect(controlRef.current.viaPoints).toEqual([{ lat: 2, lon: 2 }]);
  });
});
