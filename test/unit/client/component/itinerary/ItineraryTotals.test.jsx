import { renderWithProviders } from '../../../helpers/mock-providers';
import ItineraryTotals from '../../../../../src/client/component/itinerary/ItineraryTotals';

describe('<ItineraryTotals />', () => {
  it('should only render total distance information for non-biking itineraries', () => {
    const props = { itinerary: { legs: [{ distance: 1200, mode: 'BUS' }] } };
    const { container } = renderWithProviders(<ItineraryTotals {...props} />, {
      config: { CONFIG: 'hsl', URL: {}, imperialEnabled: false },
    });

    expect(container.querySelectorAll('.itinerary-profile-item')).toHaveLength(1);
    expect(container.querySelector('.itinerary-profile-item-value').textContent).toBe('1.2 km');
  });
});
