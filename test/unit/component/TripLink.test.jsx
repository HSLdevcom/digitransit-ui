import { renderWithProviders } from '../helpers/mock-providers';
import { relayMock } from '../helpers/mock-relay';
import TripLink from '../../../app/component/routepage/TripLink';

const vehicle = {
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
};

describe('<TripLink />', () => {
  it('should render the icon wrapped by a link once the trip query resolves', () => {
    relayMock.query(null, {
      trip: {
        route: { gtfsId: 'OULU:15' },
        pattern: { code: '1' },
        gtfsId: 'OULU:12345',
      },
    });
    const { container } = renderWithProviders(<TripLink vehicle={vehicle} />);
    // found's <Link> is globally stubbed (test/unit/helpers/vitest.setup.js)
    // to render only its children, with no wrapping <a>/className - so the
    // resolved branch can only be distinguished from the pending/fallback
    // branch (below) by the *absence* of the fallback's own
    // "route-now-content" wrapper span, not by inspecting an anchor.
    expect(container.querySelectorAll('.route-now-content')).toHaveLength(0);
    expect(container.querySelectorAll('.large-vehicle-icon')).toHaveLength(1);
  });

  it('should render the icon-only Suspense fallback while the trip query is pending', () => {
    relayMock.query(null, relayMock.pending);
    const { container } = renderWithProviders(<TripLink vehicle={vehicle} />);
    expect(container.querySelectorAll('.route-now-content')).toHaveLength(1);
    expect(container.querySelectorAll('.large-vehicle-icon')).toHaveLength(1);
  });
});
