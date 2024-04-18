import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import ItineraryLegs from '../../../app/component/ItineraryLegs';

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
