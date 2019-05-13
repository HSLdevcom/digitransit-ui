import React from 'react';

import { shallowWithIntl, mountWithIntl } from '../helpers/mock-intl-enzyme';
import ItineraryTimePicker from '../../../app/component/ItineraryTimePicker';

describe('<ItineraryTimePicker />', () => {
  it('should render', () => {
    const props = {
      changeTime: () => {},
      initHours: '12',
      initMin: '30',
    };
    const wrapper = shallowWithIntl(<ItineraryTimePicker {...props} />).dive();
    expect(wrapper.isEmptyRender()).to.equal(false);
  });

  it('should not change the existing state if the props have not been changed', () => {
    const props = {
      changeTime: () => {},
      initHours: '15',
      initMin: '45',
    };
    const wrapper = mountWithIntl(
      shallowWithIntl(<ItineraryTimePicker {...props} />).get(0),
    );
    wrapper.find('#inputHours').simulate('change', { target: { value: '12' } });
    wrapper.setProps({ initHours: '15', initMin: '45' });
    expect(wrapper.state()).to.deep.equal({ hour: '12', minute: '45' });
  });
});
