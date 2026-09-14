import React from 'react';
import { ReactRelayContext } from 'react-relay';
import { renderWithProviders } from '../helpers/mock-providers';
import TripLink from '../../../app/component/routepage/TripLink';

describe('<TripLink />', () => {
  it('should render content and icon', () => {
    const props = {
      trip: {
        trip: {
          route: {
            gtfsId: 'OULU:15',
          },
          pattern: {
            code: '1',
          },
          gtfsId: 'OULU:12345',
        },
      },
      vehicle: {
        mode: 'bus',
        id: 'OULU:1074',
        tripId: 'OULU:0000075602101021',
        shortName: '74',
        route: 'feed:1',
        direction: 0,
        tripStartTime: '0600',
        operatingDay: '0',
        next_stop: '2',
        timestamp: 0,
      },
    };
    // Empty environment keeps the QueryRenderer unresolved, so the component
    // renders its icon-only fallback content.
    const { container } = renderWithProviders(
      <ReactRelayContext.Provider value={{ environment: {} }}>
        <TripLink {...props} />
      </ReactRelayContext.Provider>,
    );
    expect(container.querySelectorAll('.route-now-content')).to.have.lengthOf(
      1,
    );
    expect(container.querySelectorAll('.large-vehicle-icon')).to.have.lengthOf(
      1,
    );
  });
});
