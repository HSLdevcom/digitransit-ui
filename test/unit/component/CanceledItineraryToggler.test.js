import React from 'react';
import sinon from 'sinon';

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
    expect(
      wrapper.find('#canceled-itineraries-amount').props().values,
    ).to.deep.equal({ itineraryAmount: props.canceledItinerariesAmount });
  });

  it('should notify the user about cancelled itineraries being shown with a banner', () => {
    const props = {
      showItineraries: true,
      toggleShowCanceled: () => {},
      canceledItinerariesAmount: 2,
    };
    const wrapper = shallowWithIntl(<CanceledItineraryToggler {...props} />);
    expect(wrapper.find('.additional-canceled-itineraries')).to.have.lengthOf(
      1,
    );
    expect(
      wrapper.find('#canceled-itineraries-amount-hide').props().values,
    ).to.deep.equal({ itineraryAmount: props.canceledItinerariesAmount });
  });

  it('should call the toggle function on click', () => {
    const props = {
      toggleShowCanceled: sinon.stub(),
    };
    const wrapper = shallowWithIntl(<CanceledItineraryToggler {...props} />);
    wrapper.simulate('click');
    expect(props.toggleShowCanceled.called).to.equal(true);
  });

  it('should call the toggle function on keydown', () => {
    const props = {
      toggleShowCanceled: sinon.stub(),
    };
    const wrapper = shallowWithIntl(<CanceledItineraryToggler {...props} />);
    wrapper.simulate('keydown', { key: 'Enter', preventDefault: () => {} });
    expect(props.toggleShowCanceled.called).to.equal(true);
  });
});
