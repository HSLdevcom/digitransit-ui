import React from 'react';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import { mountWithIntl } from './helpers/mock-intl-enzyme';
import {
  component as DTAutosuggestPanel,
  getEmptyViaPointPlaceHolder,
} from '../../app/component/DTAutosuggestPanel';
import { otpToLocation } from '../../app/util/otpStrings';

describe('<DTAutosuggestPanel />', () => {
  const selectors = {
    addViaPoint: '.itinerary-search-control > .add-via-point',
    itinerarySearchControl: '.itinerary-search-control',
    removeViaPoint: '.itinerary-search-control > .remove-via-point',
    swap: '.itinerary-search-control > .switch',
    toggleViaPointSlack: '.itinerary-search-control > .add-via-point-slack',
    viaPointSlackContainer: '.input-viapoint-slack-container',
    viaPointContainer: '.viapoints-container > .viapoint-container',
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
      initialViaPoints: [getEmptyViaPointPlaceHolder()],
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
        getEmptyViaPointPlaceHolder(),
        getEmptyViaPointPlaceHolder(),
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
        getEmptyViaPointPlaceHolder(),
        getEmptyViaPointPlaceHolder(),
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

  it('should show the add via point button after removing an empty via point with a keypress', () => {
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

    expect(wrapper.find(selectors.viaPointContainer)).to.have.lengthOf(0);
    expect(wrapper.find(selectors.addViaPoint)).to.have.lengthOf(1);
  });

  it('should allow to add a maximum of 5 via points', () => {
    const props = {
      ...mockData,
      initialViaPoints: [
        getEmptyViaPointPlaceHolder(),
        getEmptyViaPointPlaceHolder(),
        getEmptyViaPointPlaceHolder(),
        getEmptyViaPointPlaceHolder(),
        getEmptyViaPointPlaceHolder(),
      ],
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    expect(wrapper.find(selectors.viaPointContainer)).to.have.lengthOf(5);
    expect(
      wrapper.find(selectors.addViaPoint).get(0).props.className,
    ).to.contain('collapsed');
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

    expect(wrapper.find(selectors.viaPointContainer)).to.have.lengthOf(1);
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

  it('should also swap via points while keeping empty ones', () => {
    let callCount = 0;
    const viaPoints = [
      'Kalasatama, Helsinki::60.187571,24.976301',
      'Kamppi, Helsinki::60.168438,24.929283',
    ].map(otpToLocation);
    viaPoints.push(getEmptyViaPointPlaceHolder());
    viaPoints.push(getEmptyViaPointPlaceHolder());

    const props = {
      ...mockData,
      initialViaPoints: viaPoints,
      swapOrder: () => {
        callCount += 1;
      },
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    wrapper.find(selectors.swap).simulate('click');

    expect(callCount).to.equal(1);
    expect(wrapper.state('viaPoints')[0]).to.deep.equal(
      getEmptyViaPointPlaceHolder(),
    );
    expect(wrapper.state('viaPoints')[1]).to.deep.equal(
      getEmptyViaPointPlaceHolder(),
    );
  });

  it('should not display any via point containers if there are no via points available', () => {
    const props = {
      ...mockData,
      initialViaPoints: [],
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    expect(wrapper.find(selectors.viaPointContainer)).to.have.lengthOf(0);
  });

  it('should be able select a slack time value for an empty via point', () => {
    let callArgument;
    let callCount = 0;
    const props = {
      ...mockData,
      updateViaPoints: newViaPoints => {
        callArgument = newViaPoints;
        callCount += 1;
      },
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    wrapper.find(selectors.toggleViaPointSlack).simulate('click');
    wrapper.find('select').prop('onChange')({ target: { value: 1200 } });

    expect(callArgument).to.deep.equal([]);
    expect(callCount).to.equal(1);
    expect(wrapper.state('viaPoints')).to.deep.equal([{ locationSlack: 1200 }]);
  });

  it('should show an attention icon if the user has selected a via point slack time and the selector is hidden', () => {
    const props = {
      ...mockData,
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    wrapper.find(selectors.toggleViaPointSlack).simulate('click');
    wrapper.find('select').prop('onChange')({ target: { value: 1200 } });

    expect(wrapper.find('svg.super-icon').prop('className')).to.contain(
      'collapsed',
    );

    wrapper.find(selectors.toggleViaPointSlack).simulate('click');

    expect(wrapper.find('svg.super-icon').prop('className')).to.not.contain(
      'collapsed',
    );
  });

  it('should remove the attention icon if the slack time is set back to default', () => {
    const props = {
      ...mockData,
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    wrapper.find(selectors.toggleViaPointSlack).simulate('click');
    wrapper.find('select').prop('onChange')({ target: { value: '1200' } });
    wrapper.find('select').prop('onChange')({ target: { value: '0' } });
    wrapper.find(selectors.toggleViaPointSlack).simulate('click');

    expect(wrapper.find('svg.super-icon').prop('className')).to.contain(
      'collapsed',
    );
  });

  it('should clear the via points when removing the last via point', () => {
    let callArgument;
    let callCount = 0;
    const props = {
      ...mockData,
      initialViaPoints: [
        otpToLocation('Kamppi, Helsinki::60.168438,24.929283'),
      ],
      updateViaPoints: newViaPoints => {
        callArgument = newViaPoints;
        callCount += 1;
      },
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    wrapper.find(selectors.removeViaPoint).simulate('click');

    expect(callArgument).to.deep.equal([]);
    expect(callCount).to.equal(1);
  });

  it('should clear the via points when removing the last non-empty via point', () => {
    let callArgument;
    let callCount = 0;
    const props = {
      ...mockData,
      initialViaPoints: [
        otpToLocation('Kamppi, Helsinki::60.168438,24.929283'),
        getEmptyViaPointPlaceHolder(),
      ],
      updateViaPoints: newViaPoints => {
        callArgument = newViaPoints;
        callCount += 1;
      },
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    wrapper
      .find(selectors.removeViaPoint)
      .first()
      .simulate('click');

    expect(callArgument).to.deep.equal([]);
    expect(callCount).to.equal(1);
  });

  it('should only set the slack time for a single empty via point at a time', () => {
    const emptyViaPoint = getEmptyViaPointPlaceHolder();
    const props = {
      ...mockData,
      initialViaPoints: [emptyViaPoint, emptyViaPoint],
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
      .find('select')
      .first()
      .prop('onChange')({ target: { value: '1200' } });

    expect(wrapper.state('viaPoints')).to.deep.equal([
      { locationSlack: 1200 },
      {},
    ]);
  });

  it('should update the via points when dropping a dragged via point', () => {
    let callArgument;
    let callCount = 0;
    const props = {
      ...mockData,
      initialViaPoints: [
        'Kalasatama, Helsinki::60.187571,24.976301',
        'Kamppi, Helsinki::60.168438,24.929283',
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
      ].map(otpToLocation),
      updateViaPoints: newViaPoints => {
        callArgument = newViaPoints;
        callCount += 1;
      },
    };
    const wrapper = mountWithIntl(<DTAutosuggestPanel {...props} />, {
      context,
      childContextTypes,
    });

    const getEventMock = sourceIndex => ({
      preventDefault: () => {},
      dataTransfer: {
        getData: mimeType =>
          mimeType === 'text' ? `${sourceIndex}` : undefined,
      },
    });

    // dropping 1 on 1 -> nothing should happen
    wrapper.instance().handleOnViaPointDrop(getEventMock(1), 1);
    expect(callArgument).to.equal(undefined);
    expect(callCount).to.equal(0);

    // dropping 0 on 1 -> nothing should happen
    wrapper.instance().handleOnViaPointDrop(getEventMock(0), 1);
    expect(callArgument).to.equal(undefined);
    expect(callCount).to.equal(0);

    // dropping 1 on 2 -> nothing should happen
    wrapper.instance().handleOnViaPointDrop(getEventMock(1), 2);
    expect(callArgument).to.equal(undefined);
    expect(callCount).to.equal(0);

    // dropping 1 on 0 -> order should change
    wrapper.instance().handleOnViaPointDrop(getEventMock(1), 0);
    expect(callArgument).to.deep.equal(
      [
        'Kamppi, Helsinki::60.168438,24.929283',
        'Kalasatama, Helsinki::60.187571,24.976301',
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
      ].map(otpToLocation),
    );
    expect(callCount).to.equal(1);

    // dropping 0 on 2 -> order should change
    wrapper.instance().handleOnViaPointDrop(getEventMock(0), 2);
    expect(callArgument).to.deep.equal(
      [
        'Kalasatama, Helsinki::60.187571,24.976301',
        'Kamppi, Helsinki::60.168438,24.929283',
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
      ].map(otpToLocation),
    );
    expect(callCount).to.equal(2);

    // dropping 2 on 1 -> order should change
    wrapper.instance().handleOnViaPointDrop(getEventMock(2), 1);
    expect(callArgument).to.deep.equal(
      [
        'Kalasatama, Helsinki::60.187571,24.976301',
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365',
        'Kamppi, Helsinki::60.168438,24.929283',
      ].map(otpToLocation),
    );
    expect(callCount).to.equal(3);
  });
});
