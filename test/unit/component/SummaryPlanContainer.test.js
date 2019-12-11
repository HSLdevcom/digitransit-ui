import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import {
  getRelayContextMock,
  mockRelayChildContextTypes,
} from '../helpers/mock-relay';
import defaultConfig from '../../../app/configurations/config.default';

import { Component as SummaryPlanContainer } from '../../../app/component/SummaryPlanContainer';

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
  quickOptions: {
    public_transport: {
      availableOptionSets: [
        'least-transfers',
        'least-walking',
        'public-transport-with-bicycle',
        'saved-settings',
      ],
    },
    walk: {
      availableOptionSets: ['prefer-walking-routes', 'saved-settings'],
    },
    bicycle: {
      availableOptionSets: [
        'least-elevation-changes',
        'prefer-greenways',
        'saved-settings',
      ],
    },
    car_park: {
      availableOptionSets: [
        'least-transfers',
        'least-walking',
        'saved-settings',
      ],
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
};

describe('<SummaryPlanContainer />', () => {
  it('should disable the earlier/later buttons if there are no itineraries available', () => {
    const wrapper = mountWithIntl(<SummaryPlanContainer {...props} />, {
      context: {
        ...mockContext,
        ...getRelayContextMock(),
        config,
      },
      childContextTypes: {
        ...mockChildContextTypes,
        ...mockRelayChildContextTypes,
      },
    });
    expect(
      wrapper.find('.time-navigation-earlier-btn[disabled=true]'),
    ).to.have.lengthOf(1);
    expect(
      wrapper.find('.time-navigation-later-btn[disabled=true]'),
    ).to.have.lengthOf(1);
  });

  // Sometimes OTP cannot return proper response. "itineraries" are null and
  // "error" contains information about what happened
  it('should disable the earlier/later buttons if OTP does not return a response', () => {
    const props2 = {
      ...props,
      itineraries: null,
      error: 'Error: Server does not return response for request with id...',
    };
    const wrapper = mountWithIntl(<SummaryPlanContainer {...props2} />, {
      context: {
        ...mockContext,
        ...getRelayContextMock(),
        config,
      },
      childContextTypes: {
        ...mockChildContextTypes,
        ...mockRelayChildContextTypes,
      },
    });
    expect(
      wrapper.find('.time-navigation-earlier-btn[disabled=true]'),
    ).to.have.lengthOf(1);
    expect(
      wrapper.find('.time-navigation-later-btn[disabled=true]'),
    ).to.have.lengthOf(1);
  });

  it('should inform user if origin and destination are close to each other', () => {
    const props3 = {
      ...props,
      itineraries: null,
      params: {
        from: 'Kamppi, Helsinki::60.169022,24.931691',
        to: 'Kamppi, Helsinki::60.169022,24.931691',
      },
    };
    const wrapper = mountWithIntl(<SummaryPlanContainer {...props3} />, {
      context: {
        ...mockContext,
        ...getRelayContextMock(),
        config,
      },
      childContextTypes: {
        ...mockChildContextTypes,
        ...mockRelayChildContextTypes,
      },
    });
    expect(wrapper.find('.no-route-icon .info')).to.have.lengthOf(1);
    expect(
      wrapper.find({ id: 'no-route-origin-near-destination' }),
    ).to.have.lengthOf(1);
  });

  it('should inform if user is already at destination', () => {
    const props4 = {
      ...props,
      itineraries: null,
      locationState: {
        lat: 60.169022,
        lon: 24.931691,
        hasLocation: true,
      },
      params: {
        from: 'Kamppi, Helsinki::60.169022,24.931691',
        to: 'Kamppi, Helsinki::60.169022,24.931691',
      },
    };
    const wrapper = mountWithIntl(<SummaryPlanContainer {...props4} />, {
      context: {
        ...mockContext,
        ...getRelayContextMock(),
        config,
      },
      childContextTypes: {
        ...mockChildContextTypes,
        ...mockRelayChildContextTypes,
      },
    });
    expect(wrapper.find('.no-route-icon .info')).to.have.lengthOf(1);
    expect(
      wrapper.find({ id: 'no-route-already-at-destination' }),
    ).to.have.lengthOf(1);
  });
});
