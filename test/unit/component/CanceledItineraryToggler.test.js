import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import CanceledItineraryToggler from '../../../app/component/CanceledItineraryToggler';

describe('<CanceledItineraryToggler />', () => {
  it('should notify the user about cancelled itineraries being hidden with a banner', () => {
    const props = {
      showItineraries: false,
      toggleShowCanceled: () => {},
      canceledItinerariesAmount: 2,
    };
    const wrapper = shallowWithIntl(<CanceledItineraryToggler {...props} />);
    expect(wrapper.find('.additional-canceled-itineraries')).to.have.lengthOf(
      1,
    );
  });
});
