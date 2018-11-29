import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl, shallowWithIntl } from '../helpers/mock-intl-enzyme';
import ItineraryLegs from '../../../app/component/ItineraryLegs';

import data from '../test-data/dcw12';

describe('<ItineraryLegs />', () => {
  it('should not fail to render even if the first leg is an intermediate place', () => {
    const props = {
      itinerary: {
        endTime: data.firstLegIsAnIntermediatePlace[3].endTime,
        legs: data.firstLegIsAnIntermediatePlace,
      },
    };
    const wrapper = mountWithIntl(<ItineraryLegs {...props} />, {
      context: {
        ...mockContext,
        config: {
          itinerary: {
            waitThreshold: 180,
          },
        },
      },
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
    };
    const wrapper = shallowWithIntl(<ItineraryLegs {...props} />, {
      context: {
        config: {
          itinerary: {
            waitThreshold: 180,
          },
        },
      },
    });

    expect(wrapper.isEmptyRender()).to.equal(true);
  });
});
