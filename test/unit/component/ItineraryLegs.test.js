import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import sinon from 'sinon';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl, shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as ItineraryLegs } from '../../../app/component/ItineraryLegs';

import data from '../test-data/dcw12';
import dt2831b from '../test-data/dt2831b';

describe('<ItineraryLegs />', () => {
  it('should not fail to render even if the first leg is an intermediate place', () => {
    const props = {
      itinerary: {
        endTime: data.firstLegIsAnIntermediatePlace[3].endTime,
        legs: data.firstLegIsAnIntermediatePlace,
      },
      showCanceledLegsBanner: false,
    };
    const wrapper = mountWithIntl(<ItineraryLegs {...props} />, {
      context: {
        ...mockContext,
        executeAction: () => {},
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
      showCanceledLegsBanner: false,
    };
    const wrapper = shallowWithIntl(<ItineraryLegs {...props} />, {
      context: {
        executeAction: () => {},
        config: {
          itinerary: {
            waitThreshold: 180,
          },
        },
      },
    });

    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should identify that there are legs that are cancelled in the current itinerary', () => {
    const props = {
      itinerary: dt2831b,
    };
    const executeActionStub = sinon.stub();

    shallowWithIntl(<ItineraryLegs {...props} />, {
      context: {
        ...mockContext,
        executeAction: executeActionStub,
        config: {
          itinerary: {
            waitThreshold: 180,
          },
        },
      },
      childContextTypes: mockChildContextTypes,
    });
    expect(executeActionStub.calledOnce).to.equal(true);
    expect(executeActionStub.args[0][1]).to.deep.equal(true);
  });
});
