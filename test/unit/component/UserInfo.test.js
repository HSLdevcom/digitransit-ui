import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import UserInfo from '../../../app/component/UserInfo';

describe('<UserInfo />', () => {
  const defaultProps = {
    user: { name: 'Matti Meikäläinen' },
    list: [
      { key: '1', messageId: 'dropdown-item-1' },
      { key: '2', messageId: 'dropdown-item-2' },
    ],
  };

  it('should open dropdown menu on click', () => {
    const wrapper = shallowWithIntl(<UserInfo {...defaultProps} />);
    expect(wrapper.find('.dropdown-list-item')).to.have.lengthOf(0);
    wrapper.find('.noborder').simulate('click');
    expect(wrapper.find('.dropdown-list-item')).to.have.lengthOf(2);
  });

  it('should render correct text', () => {
    const wrapper = shallowWithIntl(<UserInfo {...defaultProps} />);
    wrapper.find('.noborder').simulate('click');
    expect(
      wrapper
        .find(FormattedMessage)
        .at(0)
        .props().id,
    ).to.equal('dropdown-item-1');
    expect(
      wrapper
        .find(FormattedMessage)
        .at(1)
        .props().id,
    ).to.equal('dropdown-item-2');
  });
});
