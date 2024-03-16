import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl, shallowWithIntl } from '../helpers/mock-intl-enzyme';
import ItineraryLegs from '../../../app/component/ItineraryLegs';

import data from '../test-data/dcw12';

const context = {
  ...mockContext,
  match: {
    ...mockContext.match,
    location: {
      ...mockContext.match.location,
      state: {},
    },
  },
  config: { itinerary: { waitThreshold: 5 }, CONFIG: 'default' },
};

describe('<ItineraryLegs />', () => {
  it('should not fail to render even if the first leg is an intermediate place', () => {
    const props = {
      itinerary: {
        endTime: data.firstLegIsAnIntermediatePlace[3].endTime,
        legs: data.firstLegIsAnIntermediatePlace,
      },
      toggleCanceledLegsBanner: () => {},
      focusToPoint: () => {},
      focusToLeg: () => {},
    };
    const wrapper = mountWithIntl(<ItineraryLegs {...props} />, {
      context,
      childContextTypes: mockChildContextTypes,
    });

    expect(wrapper).to.have.lengthOf(1);
  });

  it("should not fail to render even if the itinerary's legs array is empty", () => {
    const props = {
      itinerary: {
        endTime: 1542814001000,
        legs: [],
      },
      toggleCanceledLegsBanner: () => {},
      waitThreshold: 180,
      focusToPoint: () => {},
      focusToLeg: () => {},
    };
    const wrapper = shallowWithIntl(<ItineraryLegs {...props} />, {
      context,
    });

    expect(wrapper.isEmptyRender()).to.equal(true);
  });
});
