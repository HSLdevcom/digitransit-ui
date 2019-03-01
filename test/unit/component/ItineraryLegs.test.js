import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import sinon from 'sinon';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl, shallowWithIntl } from '../helpers/mock-intl-enzyme';
import DefaultExport, {
  Component as ItineraryLegs,
} from '../../../app/component/ItineraryLegs';

import data from '../test-data/dcw12';
import dt2831b from '../test-data/dt2831b';

describe('<ItineraryLegs />', () => {
  it('should not fail to render even if the first leg is an intermediate place', () => {
    const props = {
      itinerary: {
        endTime: data.firstLegIsAnIntermediatePlace[3].endTime,
        legs: data.firstLegIsAnIntermediatePlace,
      },
      toggleCanceledLegsBanner: () => {},
      waitThreshold: 180,
    };
    const wrapper = mountWithIntl(<ItineraryLegs {...props} />, {
      context: mockContext,
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
    };
    const wrapper = shallowWithIntl(<ItineraryLegs {...props} />, {
      context: mockContext,
    });

    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should identify that there are legs that are cancelled in the current itinerary', () => {
    const props = {
      itinerary: dt2831b,
      toggleCanceledLegsBanner: sinon.stub(),
      waitThreshold: 180,
    };

    shallowWithIntl(<ItineraryLegs {...props} />, {
      context: mockContext,
    });
    expect(props.toggleCanceledLegsBanner.calledOnce).to.equal(true);
    expect(props.toggleCanceledLegsBanner.args[0][0]).to.equal(true);
  });

  it('should do the plumbing properly', () => {
    const props = {
      itinerary: {
        endTime: 1542814001000,
        legs: [],
      },
    };
    const config = {
      itinerary: {
        waitThreshold: 180,
      },
    };
    const executeAction = sinon.stub();

    const wrapper = mountWithIntl(<DefaultExport {...props} />, {
      context: {
        ...mockContext,
        config,
        executeAction,
      },
      childContextTypes: mockChildContextTypes,
    });
    const component = wrapper.find(ItineraryLegs);
    component.prop('toggleCanceledLegsBanner')('foobar');
    expect(executeAction.calledOnce).to.equal(true);
    expect(executeAction.args[0][1]).to.equal('foobar');
    expect(component.prop('waitThreshold')).to.equal(
      config.itinerary.waitThreshold,
    );
  });
});
