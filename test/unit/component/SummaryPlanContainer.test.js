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

describe('<SummaryPlanContainer />', () => {
  it('should disable the earlier/later buttons if there are no itineraries available', () => {
    const config = {
      areaPolygon: defaultConfig.areaPolygon,
      itinerary: {
        timeNavigation: {},
      },
    };
    const props = {
      breakpoint: 'large',
      config,
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
});
