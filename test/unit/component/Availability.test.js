import React from 'react';

import Availability from '../../../app/component/Availability';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';

describe('<Availability />', () => {
  it('should render text', () => {
    const props = {
      available: 1,
      total: 3,
      fewAvailableCount: 3,
      text: <p className="test-text">foo</p>,
      showStatusBar: true,
    };
    const wrapper = shallowWithIntl(<Availability {...props} />);
    expect(wrapper.find('.test-text').text()).to.equal('foo');
  });

  it('should render status bar when showStatusBar is true', () => {
    const props = {
      available: 2,
      total: 3,
      fewAvailableCount: 3,
      text: <p className="test-text">foo</p>,
      showStatusBar: true,
    };
    const wrapper = shallowWithIntl(<Availability {...props} />);
    expect(wrapper.find('.available-few')).to.have.lengthOf(1);
    expect(wrapper.find('.available-none')).to.have.lengthOf(1);
  });

  it('should not render status bar when showStatusBar is false', () => {
    const props = {
      available: 2,
      total: 3,
      fewAvailableCount: 3,
      text: <p className="test-text">foo</p>,
      showStatusBar: false,
    };
    const wrapper = shallowWithIntl(<Availability {...props} />);
    expect(wrapper.find('.available-few')).to.have.lengthOf(0);
    expect(wrapper.find('.available-none')).to.have.lengthOf(0);
  });
});
