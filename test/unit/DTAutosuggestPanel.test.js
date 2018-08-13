import React from 'react';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import { mountWithIntl } from './helpers/mock-intl-enzyme';
import { component as DTAutosuggestPanel } from '../../app/component/DTAutosuggestPanel';

describe('<DTAutosuggestPanel />', () => {
  const selectors = {
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
      isViaPoint: true,
      viaPointNames: [' '],
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
      viaPointNames: [' ', ' '],
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
      viaPointNames: [
        'Kalasatama, Helsinki::60.187571,24.976301',
        'Kamppi, Helsinki::60.168438,24.929283',
        'Kalasatama, Helsinki::60.187571,24.976301',
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
    expect(containers).to.have.lengthOf(3);
    expect(containers.get(0).props.className).to.not.contain('collapsed');
    expect(containers.get(1).props.className).to.contain('collapsed');
    expect(containers.get(2).props.className).to.contain('collapsed');
  });

  it('should also remove the related slack time display after removing a via point (with multiple via points)', () => {
    let callCount = 0;
    const viaPointNames = [
      'Kalasatama, Helsinki::60.187571,24.976301',
      'Kamppi, Helsinki::60.168438,24.929283',
      'Kalasatama, Helsinki::60.187571,24.976301',
    ];
    const removeViapoints = viaPointIndex => {
      viaPointNames.splice(viaPointIndex, 1);
      callCount += 1;
    };

    const props = {
      ...mockData,
      removeViapoints,
      viaPointNames,
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
    expect(viaPointNames).to.have.lengthOf(2);
    expect(wrapper.state('activeSlackInputs')).to.deep.equal([]);

    wrapper.setProps({ viaPointNames });

    const containers = wrapper.find(selectors.viaPointSlackContainer);
    expect(containers).to.have.lengthOf(2);
    expect(containers.get(0).props.className).to.contain('collapsed');
    expect(containers.get(1).props.className).to.contain('collapsed');
  });

  it('should also decrement the slack time indices when removing a preceding via point', () => {
    const viaPointNames = [
      'Kalasatama, Helsinki::60.187571,24.976301',
      'Kamppi, Helsinki::60.168438,24.929283',
      'Kalasatama, Helsinki::60.187571,24.976301',
    ];
    const removeViapoints = viaPointIndex => {
      viaPointNames.splice(viaPointIndex, 1);
    };

    const props = {
      ...mockData,
      removeViapoints,
      viaPointNames,
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
    expect(viaPointNames).to.have.lengthOf(2);
    expect(wrapper.state('activeSlackInputs')).to.deep.equal([1]);

    wrapper.setProps({ viaPointNames });

    const containers = wrapper.find(selectors.viaPointSlackContainer);
    expect(containers).to.have.lengthOf(2);
    expect(containers.get(0).props.className).to.contain('collapsed');
    expect(containers.get(1).props.className).to.not.contain('collapsed');
  });

  it('should only collapse the related slack time panel (with multiple slack time panels open)', () => {
    const props = {
      ...mockData,
      viaPointNames: [' ', ' '],
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
});
