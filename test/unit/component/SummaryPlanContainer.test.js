import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import defaultConfig from '../../../app/configurations/config.default';

import { Component as SummaryPlanContainer } from '../../../app/component/SummaryPlanContainer';
import TimeNavigationButtons from '../../../app/component/TimeNavigationButtons';

const config = {
  areaPolygon: defaultConfig.areaPolygon,
  itinerary: {
    timeNavigation: {},
  },
  minDistanceBetweenFromAndTo: 20,
  defaultOptions: {
    walkBoardCost: {
      least: 3600,
      less: 1200,
      more: 360,
      most: 120,
    },
    walkReluctance: {
      least: 5,
      less: 3,
      more: 1,
      most: 0.2,
    },
  },
  streetModes: {
    public_transport: {
      availableForSelection: true,
      defaultValue: true,
      exclusive: false,
      icon: 'bus-withoutBox',
    },

    walk: {
      availableForSelection: true,
      defaultValue: false,
      exclusive: true,
      icon: 'walk',
    },

    bicycle: {
      availableForSelection: true,
      defaultValue: false,
      exclusive: true,
      icon: 'bicycle-withoutBox',
    },

    car: {
      availableForSelection: true,
      defaultValue: false,
      exclusive: true,
      icon: 'car-withoutBox',
    },

    car_park: {
      availableForSelection: false,
      defaultValue: false,
      exclusive: false,
      icon: 'car_park-withoutBox',
    },
  },
  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
    },

    tram: {
      availableForSelection: true,
      defaultValue: true,
    },

    rail: {
      availableForSelection: true,
      defaultValue: true,
    },

    subway: {
      availableForSelection: true,
      defaultValue: true,
    },

    airplane: {
      availableForSelection: true,
      defaultValue: true,
    },

    ferry: {
      availableForSelection: true,
      defaultValue: true,
    },

    citybike: {
      availableForSelection: false,
      defaultValue: false, // always false
    },
  },
  cityBike: {
    networks: {},
  },
};

const props = {
  breakpoint: 'large',
  config,
  currentTime: 1535490633000,
  itineraries: [],
  params: {
    from: 'Kamppi, Helsinki::60.169022,24.931691',
    to: 'Vuosaari, Helsinki::60.207129,25.144063',
  },
  plan: {
    date: 1535490633000,
  },
  serviceTimeRange: {
    end: 1538341199,
    start: 1535490000,
  },
  setError: () => {},
  setLoading: () => {},
  toggleSettings: () => {},
  bikeAndPublicItinerariesToShow: 0,
  bikeAndParkItinerariesToShow: 0,
};

describe('<SummaryPlanContainer />', () => {
  it('should disable the earlier/later buttons if there are no itineraries available', () => {
    const wrapper = shallowWithIntl(<SummaryPlanContainer {...props} />, {
      context: {
        ...mockContext,
        config,
      },
    });
    const timeNavigationButtons = wrapper.find(TimeNavigationButtons);
    expect(timeNavigationButtons).to.have.lengthOf(1);
    expect(timeNavigationButtons.prop('isEarlierDisabled')).to.equal(true);
    expect(timeNavigationButtons.prop('isLaterDisabled')).to.equal(true);
  });

  // Sometimes OTP cannot return proper response. "itineraries" are null and
  // "error" contains information about what happened
  it('should disable the earlier/later buttons if OTP does not return a response', () => {
    const props2 = {
      ...props,
      itineraries: null,
      error: 'Error: Server does not return response for request with id...',
    };
    const wrapper = shallowWithIntl(<SummaryPlanContainer {...props2} />, {
      context: {
        ...mockContext,
        config,
      },
    });
    const timeNavigationButtons = wrapper.find(TimeNavigationButtons);
    expect(timeNavigationButtons).to.have.lengthOf(1);
    expect(timeNavigationButtons.prop('isEarlierDisabled')).to.equal(true);
    expect(timeNavigationButtons.prop('isLaterDisabled')).to.equal(true);
  });
});
