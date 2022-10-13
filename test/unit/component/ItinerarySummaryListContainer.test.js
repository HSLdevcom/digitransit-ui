import React from 'react';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as ItinerarySummaryListContainer } from '../../../app/component/ItinerarySummaryListContainer/ItinerarySummaryListContainer';

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
  itineraries: [],
  onSelect: noop,
  onSelectImmediately: noop,
  searchTime: 1656509749000,
  to: {},
  bikeAndPublicItinerariesToShow: 0,
  bikeAndParkItinerariesToShow: 0,
  walking: true,
  biking: false,
  showAlternativePlan: false,
  loading: false,
  driving: false,
};

describe('<ItinerarySummaryListContainer />', () => {
  xit('should render the component for canceled itineraries', () => {
    // TODO: enzyme is currently missing support for react hooks
    const props = {
      ...PROPS_TEMPLATE,
      currentTime: 1234567890,
      searchTime: 1234567890,
    };
    const wrapper = mountWithIntl(
      <div>
        <ItinerarySummaryListContainer {...props} />
      </div>,
      { context: mockContext, childContextTypes: mockChildContextTypes },
    );
    // TODO: purposeful test case definition missing -> skip test
    expect(wrapper.debug()).to.equal(undefined);
  });

  it('should render without crashing', () => {
    const props = {
      ...PROPS_TEMPLATE,
    };

    const wrapper = mountWithIntl(
      <div>
        <ItinerarySummaryListContainer {...props} />
      </div>,
      { context: mockContext, childContextTypes: mockChildContextTypes },
    );

    expect(wrapper.isEmptyRender()).to.equal(false);
  });
});
