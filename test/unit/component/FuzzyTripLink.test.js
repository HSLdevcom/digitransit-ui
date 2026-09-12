import React from 'react';
import { ReactRelayContext } from 'react-relay';
import { renderWithProviders } from '../helpers/mock-providers';
import FuzzyTripLink from '../../../app/component/routepage/FuzzyTripLink';

describe('<FuzzyTripLink />', () => {
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
        direction: 0,
        mode: 'bus',
        operatingDay: '2020-05-09',
        route: 'HSL:2550',
        tripStartTime: '2143',
        shortName: '550',
      },
      stopName: '1',
      nextStopName: '2',
    };
    // Empty environment keeps the QueryRenderer unresolved, so the component
    // renders its icon-only fallback content.
    const { container } = renderWithProviders(
      <ReactRelayContext.Provider value={{ environment: {} }}>
        <FuzzyTripLink {...props} />
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
