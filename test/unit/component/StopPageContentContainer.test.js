import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as StopPageContentContainer } from '../../../app/component/StopPageContentContainer';

describe('<StopPageContentContainer />', () => {
  it("should show a 'no departures' indicator", () => {
    const props = {
      currentTime: 0,
      params: {
        stopId: '1234',
      },
      relay: {
        setVariables: () => {},
        variables: {
          startTime: '1234',
        },
      },
      stop: {},
    };
    const wrapper = shallowWithIntl(<StopPageContentContainer {...props} />);
    expect(wrapper.find('.stop-no-departures-container')).to.have.lengthOf(1);
  });
});
