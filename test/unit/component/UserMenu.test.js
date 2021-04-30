import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import UserMenu from '../../../app/component/UserMenu';

describe('<UserMenu />', () => {
  const defaultProps = {
    user: { given_name: 'Matti', family_name: 'Meikäläinen' },
    menuItems: [
      { key: '1', messageId: 'usermenu-item-1' },
      { key: '2', messageId: 'usermenu-item-2' },
    ],
  };

  it("should render initials of user's name", () => {
    const wrapper = mountWithIntl(<UserMenu {...defaultProps} />);
    expect(wrapper.find('.usermenu-title-text').text()).to.contain('MM');
  });

  it('should open userinfo menu on click', () => {
    const wrapper = mountWithIntl(<UserMenu {...defaultProps} />);
    expect(wrapper.find('.usermenu-list-item')).to.have.lengthOf(0);
    wrapper.find('#extendUserMenu').simulate('click');
    expect(wrapper.find('.usermenu-list-item')).to.have.lengthOf(2);
  });

  it('should render correct menu items', () => {
    const wrapper = mountWithIntl(<UserMenu {...defaultProps} />);
    wrapper.find('#extendUserMenu').simulate('click');
    expect(wrapper.find('a').at(0).text()).to.contain('usermenu-item-1');
    expect(wrapper.find('a').at(1).text()).to.contain('usermenu-item-2');
  });
});
