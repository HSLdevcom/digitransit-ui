import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { mockContext } from '../helpers/mock-context';
import { Component as AddFavouriteContainer } from '../../../app/component/AddFavouriteContainer';

describe('<AddFavouriteContainer />', () => {
  describe('setLocationProperties', () => {
    it('should update the favourite with location properties', () => {
      const wrapper = shallowWithIntl(<AddFavouriteContainer />, {
        context: mockContext,
      });

      const favourite = {
        gid: 'id',
        favouriteId: 'fav-id',
      };
      wrapper.setState({ favourite });

      const location = {
        id: 'id',
        gtfsId: 'gtfsId',
        favouriteId: 'fav-id',
        code: 'loc-code',
        layer: 'foo',
        lat: 63,
        lon: 25,
        address: 'loc-address',
      };
      wrapper.instance().setLocationProperties(location);

      expect(wrapper.state('favourite')).to.deep.equal({
        gid: 'id',
        gtfsId: 'gtfsId',
        favouriteId: 'fav-id',
        code: 'loc-code',
        layer: 'foo',
        lat: 63,
        lon: 25,
        address: 'loc-address',
      });
    });
  });

  describe('specifyName', () => {
    it('should update the favourite with the given name', () => {
      const wrapper = shallowWithIntl(<AddFavouriteContainer />, {
        context: mockContext,
      });

      const favourite = {
        id: 'fav-id',
      };
      wrapper.setState({ favourite });

      const nameEvent = {
        target: {
          value: 'foobar',
        },
      };
      wrapper.instance().specifyName(nameEvent);

      expect(wrapper.state('favourite')).to.deep.equal({
        id: 'fav-id',
        name: 'foobar',
      });
    });
  });

  describe('selectIcon', () => {
    it('should update the favourite with the given icon', () => {
      const wrapper = shallowWithIntl(<AddFavouriteContainer />, {
        context: mockContext,
      });

      const favourite = {
        id: 'fav-id',
        name: 'foobar',
      };
      wrapper.setState({ favourite });

      const id = 'icon-icon_home';
      wrapper.instance().selectIcon(id);

      expect(wrapper.state('favourite')).to.deep.equal({
        id: 'fav-id',
        name: 'foobar',
        selectedIconId: 'icon-icon_home',
      });
    });

    it('should use a default name for the favourite icon', () => {
      const wrapper = shallowWithIntl(<AddFavouriteContainer />, {
        context: mockContext,
      });

      const favourite = {
        id: 'fav-id',
      };
      wrapper.setState({ favourite });

      const id = 'icon-icon_home';
      wrapper.instance().selectIcon(id);

      expect(wrapper.state('favourite')).to.deep.equal({
        id: 'fav-id',
        name: 'Home',
        selectedIconId: 'icon-icon_home',
      });
    });
  });
});
