import { renderWithProviders } from './helpers/mock-providers';

import ItineraryDetails from '../../app/component/itinerary/ItineraryDetails';
import dt2831 from './test-data/dt2831';

const itinerary = {
  ...dt2831,
  start: new Date(dt2831.startTime).toISOString(),
  end: new Date(dt2831.endTime).toISOString(),
  legs: dt2831.legs.map(leg => ({
    ...leg,
    start: { scheduledTime: new Date(leg.startTime).toISOString() },
    end: { scheduledTime: new Date(leg.endTime).toISOString() },
    route: leg.route && {
      ...leg.route,
      agency: leg.route.agency && {
        ...leg.route.agency,
        name: 'Helsingin seudun liikenne',
        url: 'https://www.hsl.fi',
      },
    },
    agency: leg.route?.agency && {
      ...leg.route.agency,
      name: 'Helsingin seudun liikenne',
      url: 'https://www.hsl.fi',
    },
  })),
};

const props = {
  itinerary,
  focusToPoint: () => {},
  focusToLeg: () => {},
  openSettings: () => {},
  showCanceledLegsBanner: false,
  plan: {
    date: 19700101,
  },
  isMobile: false,
  currentTime: 0,
  lang: 'fi',
  tabIndex: 0,
};

describe('<ItineraryDetails />', () => {
  it('should render the container div', () => {
    const { container } = renderWithProviders(<ItineraryDetails {...props} />);
    expect(container.querySelector('.itinerary-tab')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    renderWithProviders(<ItineraryDetails {...props} />);
    await expect(document.body).toHaveNoA11yViolations();
  });
});
