import data from '../../../test-data/dcw31';
import { renderWithProviders } from '../../../helpers/mock-providers';
import ItinerarySummary from '../../../../../src/client/component/itinerary/ItinerarySummary';

const NONE = { distance: 0, duration: 0 };
const baseProps = {
  walking: NONE,
  biking: NONE,
  driving: NONE,
  futureText: '',
  isMultiRow: false,
  isMobile: false,
  hideBottomDivider: false,
};

describe('<ItinerarySummary />', () => {
  it('should show biking distance and walking distance', () => {
    const props = {
      ...baseProps,
      itinerary: data.bikingAndWalking,
      biking: { distance: 1000, duration: 180 },
      walking: { distance: 555, duration: 300 },
    };
    const { container } = renderWithProviders(<ItinerarySummary {...props} />);
    expect(container.querySelectorAll('.distance--itinerary-summary')).toHaveLength(2);
  });

  it('should show walking distance before biking distance', () => {
    const props = {
      ...baseProps,
      itinerary: data.bikingAndWalking,
      biking: { distance: 1000, duration: 180 },
      walking: { distance: 555, duration: 300 },
    };
    const { container } = renderWithProviders(<ItinerarySummary {...props} />);
    const items = container.querySelectorAll('.distance--itinerary-summary');
    expect(items[0].querySelector('.icon.walk')).not.toBeNull();
    expect(items[items.length - 1].querySelector('.icon.bike')).not.toBeNull();
  });

  it('should show only biking distance for only biking itinerary', () => {
    const props = {
      ...baseProps,
      itinerary: data.onlyBiking,
      biking: { distance: 1000, duration: 180 },
    };
    const { container } = renderWithProviders(<ItinerarySummary {...props} />);
    expect(container.querySelectorAll('.distance--itinerary-summary')).toHaveLength(1);
    expect(container.querySelector('.icon.bike')).not.toBeNull();
    expect(container.querySelector('.icon.walk')).toBeNull();
  });
});
