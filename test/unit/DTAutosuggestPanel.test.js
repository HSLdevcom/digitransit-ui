import React from 'react';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import { mountWithIntl } from './helpers/mock-intl-enzyme';
import {
  component as DTAutosuggestPanel,
  EMPTY_VIA_POINT_PLACE_HOLDER,
} from '../../app/component/DTAutosuggestPanel';
import { otpToLocation } from '../../app/util/otpStrings';

describe('<DTAutosuggestPanel />', () => {
  const selectors = {
    addViaPoint: '.itinerary-search-control > .addViaPoint',
    itinerarySearchControl: '.itinerary-search-control',
    removeViaPoint: '.itinerary-search-control > .removeViaPoint',
    toggleViaPointSlack: '.itinerary-search-control > .addViaPointSlack',
    viaPointSlackContainer: '.input-viapoint-slack-container',
  };

  let context;
  let childContextTypes;
  let mockData;

  beforeEach(() => {
    context = { ...mockContext };
    childContextTypes = { ...mockChildContextTypes };
    mockData = {
      breakpoint: 'large',
      origin: {
        lat: 60.169196,
        lon: 24.957674,
        address: 'Aleksanterinkatu, Helsinki',
        set: true,
        ready: true,
      },
      destination: {
        lat: 60.199093,
        lon: 24.940536,
        address: 'Opastinsilta 6, Helsinki',
        set: true,
        ready: true,
      },
      isItinerary: true,
      initialViaPoints: [EMPTY_VIA_POINT_PLACE_HOLDER],
      originPlaceHolder: 'give-origin',
      searchType: 'endpoint',
    };
  });

  it('should not show the slack time panel by default', () => {
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...mockData} />, {
      context,
      childContextTypes,
    });

    expect(wrapper.find(selectors.toggleViaPointSlack)).to.have.lengthOf(1);
    expect(wrapper.find(selectors.viaPointSlackContainer)).to.have.lengthOf(1);
    expect(
      wrapper.find(`${selectors.viaPointSlackContainer}.collapsed`),
    ).to.have.lengthOf(1);
  });

  it('should show the slack time panel after click', () => {
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...mockData} />, {
      context,
      childContextTypes,
    });

    wrapper.find(selectors.toggleViaPointSlack).simulate('click');

    expect(wrapper.find(selectors.viaPointSlackContainer)).to.have.lengthOf(1);
    expect(
      wrapper.find(`${selectors.viaPointSlackContainer}.collapsed`),
    ).to.have.lengthOf(0);
  });

  it('should show only the related slack time panel after click (with empty via points)', () => {
    const props = {
      ...mockData,
      initialViaPoints: [
        EMPTY_VIA_POINT_PLACE_HOLDER,
        EMPTY_VIA_POINT_PLACE_HOLDER,
      ],
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    wrapper
      .find(selectors.toggleViaPointSlack)
      .first()
      .simulate('click');

    const containers = wrapper.find(selectors.viaPointSlackContainer);
    expect(containers).to.have.lengthOf(2);
    expect(containers.get(0).props.className).to.not.contain('collapsed');
    expect(containers.get(1).props.className).to.contain('collapsed');
  });

  it('should show only the related slack time panel after click (with filled via points)', () => {
    const props = {
      ...mockData,
      initialViaPoints: [
        'Kalasatama, Helsinki::60.187571,24.976301',
        'Kamppi, Helsinki::60.168438,24.929283',
        'Kalasatama, Helsinki::60.187571,24.976301',
      ].map(otpToLocation),
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    wrapper
      .find(selectors.toggleViaPointSlack)
      .first()
      .simulate('click');

    const containers = wrapper.find(selectors.viaPointSlackContainer);
    expect(containers).to.have.lengthOf(3);
    expect(containers.get(0).props.className).to.not.contain('collapsed');
    expect(containers.get(1).props.className).to.contain('collapsed');
    expect(containers.get(2).props.className).to.contain('collapsed');
  });

  it('should also remove the related slack time display after removing a via point (with multiple via points)', () => {
    let callCount = 0;
    let viaPoints = [
      'Kalasatama, Helsinki::60.187571,24.976301',
      'Kamppi, Helsinki::60.168438,24.929283',
      'Kalasatama, Helsinki::60.187571,24.976301',
    ].map(otpToLocation);

    const props = {
      ...mockData,
      initialViaPoints: viaPoints,
      updateViaPoints: newViaPoints => {
        viaPoints = newViaPoints;
        callCount += 1;
      },
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    wrapper
      .find(selectors.toggleViaPointSlack)
      .first()
      .simulate('click');
    wrapper
      .find(selectors.removeViaPoint)
      .first()
      .simulate('click');

    expect(callCount).to.equal(1);
    expect(viaPoints).to.have.lengthOf(2);
    expect(wrapper.state('activeSlackInputs')).to.deep.equal([]);

    const containers = wrapper.find(selectors.viaPointSlackContainer);
    expect(containers).to.have.lengthOf(2);
    expect(containers.get(0).props.className).to.contain('collapsed');
    expect(containers.get(1).props.className).to.contain('collapsed');
  });

  it('should also decrement the slack time indices when removing a preceding via point', () => {
    let viaPoints = [
      'Kalasatama, Helsinki::60.187571,24.976301',
      'Kamppi, Helsinki::60.168438,24.929283',
      'Kalasatama, Helsinki::60.187571,24.976301',
    ].map(otpToLocation);

    const props = {
      ...mockData,
      initialViaPoints: viaPoints,
      updateViaPoints: newViaPoints => {
        viaPoints = newViaPoints;
      },
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    wrapper
      .find(selectors.toggleViaPointSlack)
      .at(2)
      .simulate('click');
    expect(wrapper.state('activeSlackInputs')).to.deep.equal([2]);

    wrapper
      .find(selectors.removeViaPoint)
      .first()
      .simulate('click');
    expect(viaPoints).to.have.lengthOf(2);
    expect(wrapper.state('activeSlackInputs')).to.deep.equal([1]);

    wrapper.setProps({ viaPoints });

    const containers = wrapper.find(selectors.viaPointSlackContainer);
    expect(containers).to.have.lengthOf(2);
    expect(containers.get(0).props.className).to.contain('collapsed');
    expect(containers.get(1).props.className).to.not.contain('collapsed');
  });

  it('should only collapse the related slack time panel (with multiple slack time panels open)', () => {
    const props = {
      ...mockData,
      initialViaPoints: [
        EMPTY_VIA_POINT_PLACE_HOLDER,
        EMPTY_VIA_POINT_PLACE_HOLDER,
      ],
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    wrapper
      .find(selectors.toggleViaPointSlack)
      .at(0)
      .simulate('click');
    wrapper
      .find(selectors.toggleViaPointSlack)
      .at(1)
      .simulate('click');
    expect(wrapper.state('activeSlackInputs')).to.deep.equal([0, 1]);

    const openContainers = wrapper.find(selectors.viaPointSlackContainer);
    expect(openContainers).to.have.lengthOf(2);
    expect(openContainers.get(0).props.className).to.not.contain('collapsed');
    expect(openContainers.get(1).props.className).to.not.contain('collapsed');

    wrapper
      .find(selectors.toggleViaPointSlack)
      .at(0)
      .simulate('click');
    expect(wrapper.state('activeSlackInputs')).to.deep.equal([1]);

    const containers = wrapper.find(selectors.viaPointSlackContainer);
    expect(containers).to.have.lengthOf(2);
    expect(containers.get(0).props.className).to.contain('collapsed');
    expect(containers.get(1).props.className).to.not.contain('collapsed');
  });

  it('should add a via point after adding and then removing a viapoint with a keypress', () => {
    const props = {
      ...mockData,
      initialViaPoints: [],
      updateViaPoints: () => {},
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    wrapper.find(selectors.addViaPoint).simulate('click');
    wrapper
      .find(selectors.removeViaPoint)
      .simulate('keypress', { key: 'Enter' });
    wrapper.find(selectors.addViaPoint).simulate('click');

    expect(wrapper.find('.viapoint-container')).to.have.lengthOf(1);
    expect(wrapper.find(selectors.removeViaPoint)).to.have.lengthOf(1);
  });

  it('should not render any itinerary search control buttons when isItinerary is false', () => {
    const props = {
      ...mockData,
      initialViaPoints: [],
      isItinerary: false,
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    expect(wrapper.find(selectors.itinerarySearchControl)).to.have.lengthOf(0);
  });
});
