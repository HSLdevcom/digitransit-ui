import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { render, act } from '@testing-library/react';
import TestProviders from '../../helpers/mock-providers';
import { mockContext } from '../../helpers/mock-context';
import {
  ItineraryLocationProvider,
  useItineraryLocationActions,
} from '../../../../app/hooks/ItineraryLocationContext';
import { Component as OriginDestinationBar } from '../../../../app/component/itinerary/OriginDestinationBar';

const origin = {
  address: 'Origin, Helsinki',
  lat: 60.199,
  lon: 24.934,
};

const destination = {
  address: 'Destination, Helsinki',
  lat: 60.17,
  lon: 24.941,
};

const newOrigin = {
  address: 'New origin, Helsinki',
  lat: 60.201,
  lon: 24.935,
};

const newDestination = {
  address: 'New destination, Helsinki',
  lat: 60.171,
  lon: 24.942,
};

// Exposes setOrigin/setDestination via a ref so tests can drive edits
// directly through context, the same way OriginDestinationBar's own
// selectHandler/swapOrder do internally, without needing to exercise the
// full autosuggest-panel UI.
function ActionsDriver({ controlRef }) {
  const actions = useItineraryLocationActions();

  useEffect(() => {
    const ref = controlRef;
    ref.current = actions;
  });

  return null;
}
ActionsDriver.propTypes = {
  controlRef: PropTypes.shape({ current: PropTypes.object }).isRequired,
};

const buildMatch = () => ({
  location: {
    pathname: `/reitti/${encodeURIComponent(
      `${origin.address}::${origin.lat},${origin.lon}`,
    )}/${encodeURIComponent(
      `${destination.address}::${destination.lat},${destination.lon}`,
    )}`,
    query: {},
  },
  params: {
    from: `${origin.address}::${origin.lat},${origin.lon}`,
    to: `${destination.address}::${destination.lat},${destination.lon}`,
  },
});

describe('OriginDestinationBar', () => {
  it('does not revert the other endpoint when origin and destination are edited in quick succession', () => {
    const match = buildMatch();
    let lastReplacedLocation;
    const router = {
      ...mockContext.router,
      replace: location => {
        lastReplacedLocation = location;
        // Deliberately do NOT update match.params here, simulating
        // router.replace()'s navigation resolving asynchronously (after
        // fetching the itinerary), so match.params still lags behind.
      },
    };
    const controlRef = { current: null };

    render(
      <TestProviders match={match} router={router}>
        <ItineraryLocationProvider>
          <ActionsDriver controlRef={controlRef} />
          <OriginDestinationBar
            isMobile={false}
            locationState={mockContext.getStore().getLocationState()}
          />
        </ItineraryLocationProvider>
      </TestProviders>,
    );

    // Edit origin first.
    act(() => {
      controlRef.current.setOrigin(newOrigin);
    });
    expect(lastReplacedLocation.pathname).toContain(
      encodeURIComponent(newOrigin.address),
    );
    expect(lastReplacedLocation.pathname).toContain(
      encodeURIComponent(destination.address),
    );

    // Before match.params has caught up, edit destination too.
    act(() => {
      controlRef.current.setDestination(newDestination);
    });

    // The final navigation must carry BOTH edits -- origin must not have
    // reverted to the original value.
    expect(lastReplacedLocation.pathname).toContain(
      encodeURIComponent(newOrigin.address),
    );
    expect(lastReplacedLocation.pathname).toContain(
      encodeURIComponent(newDestination.address),
    );
    expect(lastReplacedLocation.pathname).not.toContain(
      encodeURIComponent(origin.address),
    );
  });

  it('swaps origin and destination', () => {
    const match = buildMatch();
    let lastReplacedLocation;
    const router = {
      ...mockContext.router,
      replace: location => {
        lastReplacedLocation = location;
      },
    };
    const controlRef = { current: null };

    render(
      <TestProviders match={match} router={router}>
        <ItineraryLocationProvider>
          <ActionsDriver controlRef={controlRef} />
          <OriginDestinationBar
            isMobile={false}
            locationState={mockContext.getStore().getLocationState()}
          />
        </ItineraryLocationProvider>
      </TestProviders>,
    );

    act(() => {
      controlRef.current.setOrigin(destination);
      controlRef.current.setDestination(origin);
    });

    expect(lastReplacedLocation.pathname).toContain(
      encodeURIComponent(destination.address),
    );
    expect(lastReplacedLocation.pathname).toContain(
      encodeURIComponent(origin.address),
    );
  });
});
