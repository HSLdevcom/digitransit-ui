import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import UserInfo from '../../../app/component/UserInfo';

describe('<UserInfo />', () => {
  const defaultProps = {
    user: { name: 'Matti Meikäläinen' },
    list: [
      { key: '1', messageId: 'userinfo-item-1' },
      { key: '2', messageId: 'userinfo-item-2' },
    ],
  };

  it('should open userinfo menu on click', () => {
    const wrapper = mountWithIntl(<UserInfo {...defaultProps} />);
    expect(wrapper.find('.userinfo-list-item')).to.have.lengthOf(0);
    wrapper
      .find('.noborder')
      .at(0)
      .simulate('click');
    expect(wrapper.find('.userinfo-list-item')).to.have.lengthOf(2);
  });

  it('should render correct text', () => {
    const wrapper = mountWithIntl(<UserInfo {...defaultProps} />);
    wrapper
      .find('.noborder')
      .at(0)
      .simulate('click');
    expect(
      wrapper
        .find(FormattedMessage)
        .at(0)
        .props().id,
    ).to.equal('userinfo-item-1');
    expect(
      wrapper
        .find(FormattedMessage)
        .at(1)
        .props().id,
    ).to.equal('userinfo-item-2');
  });
});
