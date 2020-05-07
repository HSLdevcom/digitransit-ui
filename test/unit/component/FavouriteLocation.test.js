import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import FavouriteLocation from '../../../app/component/FavouriteLocation';
import Icon from '../../../app/component/Icon';

describe('<FavouriteLocation />', () => {
  const props = {
    favourite: {
      name: 'Work',
      address: 'Pasila, Helsinki',
      selectedIconId: 'icon-icon_work',
    },
    clickFavourite: () => ({}),
  };
  it('should render defined favourite', () => {
    const wrapper = shallowWithIntl(<FavouriteLocation {...props} />);
    expect(wrapper.find('.favourite-location-name').text()).to.equal('Work');
    expect(wrapper.find('.favourite-location-address').text()).to.equal(
      'Pasila, Helsinki',
    );
    expect(wrapper.find(Icon).prop('img')).to.equal('icon-icon_work');
  });
});
