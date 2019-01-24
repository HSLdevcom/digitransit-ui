import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import ItineraryFeedback from '../../../app/component/itinerary-feedback';

describe('<ItineraryFeedback />', () => {
  it('should toggle the form', () => {
    const wrapper = shallowWithIntl(<ItineraryFeedback />);

    wrapper.instance().toggleFeedbackForm();
    expect(wrapper.state('feedbackFormOpen')).to.equal(true);

    wrapper.instance().toggleFeedbackForm();
    expect(wrapper.state('feedbackFormOpen')).to.equal(false);
  });
});
