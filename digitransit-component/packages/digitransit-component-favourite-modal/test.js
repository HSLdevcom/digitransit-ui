/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow, configure } from 'enzyme';
import FavouriteModal from './src';

configure({ adapter: new Adapter() });

describe('Testing @digitransit-component/digitransit-component-favourite-modal module', () => {
  const wrapper = shallow(<FavouriteModal />);

  it('should render', () => {
    expect(wrapper.isEmptyRender()).to.equal(false);
  });
});
