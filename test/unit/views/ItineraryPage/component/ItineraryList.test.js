import React from 'react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import ItineraryList from '../../../../../app/component/itinerary/ItineraryList';

const noop = () => {};

const LOCATIONS_STATE_TEMPLATE = {
  type: 'CurrentLocation',
  lat: 60.170384,
  lon: 24.939846,
  status: 'no-location',
  hasLocation: false,
  isLocationingInProgress: false,
  isReverseGeocodingInProgress: false,
  locationingFailed: false,
};

const PROPS_TEMPLATE = {
  activeIndex: 0,
  currentTime: 1656580024206,
  locationState: LOCATIONS_STATE_TEMPLATE,
  from: {},
  planEdges: [],
  focusToHeader: noop,
  searchTime: 1656509749000,
  to: {},
  bikeAndParkItineraryCount: 0,
  walking: true,
  biking: false,
  showAlternativePlan: false,
  loading: false,
  driving: false,
};

describe('<ItineraryList />', () => {
  it('should render the empty state when there are no itineraries', () => {
    const props = {
      ...PROPS_TEMPLATE,
      currentTime: 1234567890,
      searchTime: 1234567890,
    };
    const { container } = renderWithProviders(<ItineraryList {...props} />);
    expect(container.querySelector('.summary-list-container')).to.not.equal(
      null,
    );
  });

  it('should render without crashing', () => {
    const props = {
      ...PROPS_TEMPLATE,
    };
    const { container } = renderWithProviders(<ItineraryList {...props} />);
    expect(container.querySelector('.summary-list-container')).to.not.equal(
      null,
    );
  });
});
