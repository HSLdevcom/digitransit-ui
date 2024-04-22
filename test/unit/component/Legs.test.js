import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import Legs from '../../../app/component/itinerary/Legs';

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

describe('<Legs />', () => {
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
    const wrapper = shallowWithIntl(<Legs {...props} />, {
      context,
    });

    expect(wrapper.isEmptyRender()).to.equal(true);
  });
});
