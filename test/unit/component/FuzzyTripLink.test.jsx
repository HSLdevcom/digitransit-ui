// See test/unit/component/trafficnow/TrafficNow.test.jsx for why a default
// import of 'react-relay/hooks' is used to get a stubbable live reference to
// useLazyLoadQuery (shared with the 'react-relay' import FuzzyTripLink uses).
import relayHooks from 'react-relay/hooks';
import { renderWithProviders } from '../helpers/mock-providers';
import FuzzyTripLink from '../../../app/component/routepage/FuzzyTripLink';

const vehicle = {
  direction: 0,
  mode: 'bus',
  operatingDay: '2020-05-09',
  route: 'HSL:2550',
  tripStartTime: '2143',
  shortName: '550',
};

const props = {
  vehicle,
  stopName: '1',
  nextStopName: '2',
};

describe('<FuzzyTripLink />', () => {
  it('should render the icon wrapped by a link once the fuzzy trip query resolves', () => {
    vi.spyOn(relayHooks, 'useLazyLoadQuery').mockReturnValue({
      trip: {
        route: { gtfsId: 'OULU:15' },
        pattern: { code: '1' },
        gtfsId: 'OULU:12345',
        tripShortName: '550',
      },
    });
    const { container } = renderWithProviders(<FuzzyTripLink {...props} />);
    // found's <Link> is globally stubbed (test/unit/helpers/vitest.setup.js)
    // to render only its children, with no wrapping <a>/className - so the
    // resolved branch can only be distinguished from the pending/fallback
    // branch (below) by the *absence* of the fallback's own
    // "route-now-content" wrapper span, not by inspecting an anchor.
    expect(container.querySelectorAll('.route-now-content')).toHaveLength(0);
    expect(container.querySelectorAll('.large-vehicle-icon')).toHaveLength(1);
  });

  it('should render the icon-only Suspense fallback while the fuzzy trip query is pending', () => {
    vi.spyOn(relayHooks, 'useLazyLoadQuery').mockImplementation(() => {
      throw new Promise(() => {});
    });
    const { container } = renderWithProviders(<FuzzyTripLink {...props} />);
    expect(container.querySelectorAll('.route-now-content')).toHaveLength(1);
    expect(container.querySelectorAll('.large-vehicle-icon')).toHaveLength(1);
  });
});
