import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';

import Dropdown from '../../../app/component/Dropdown';

describe('<Dropdown />', () => {
  const defaultProps = {
    username: 'Matti Meikäläinen',
    list: [
      { key: '1', messageId: 'dropdown-item-1' },
      { key: '2', messageId: 'dropdown-item-2' },
      { key: '3', messageId: 'dropdown-item-3' },
    ],
  };

  it('should open dropdown menu on click', () => {
    const wrapper = shallowWithIntl(<Dropdown {...defaultProps} />);
    wrapper.find('button').simulate('click');
    expect(wrapper.find('.dropdown-list-item')).to.have.lengthOf(3);
  });
});
