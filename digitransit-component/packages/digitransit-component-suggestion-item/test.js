/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow, configure } from 'enzyme';
import SuggestionItem from './src';

configure({ adapter: new Adapter() });

describe('Testing @digitransit-component/digitransit-component-suggestion-item module', () => {
  const item = {};
  const content = ['suggestionType', 'label', 'name'];
  const wrapper = shallow(<SuggestionItem item={item} content={content} />);

  it('should render', () => {
    expect(wrapper.isEmptyRender()).to.equal(false);
  });
});
