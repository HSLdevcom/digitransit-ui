import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import Select from '../../app/component/Select';

describe('<Select />', () => {
  it('should render a h4 element if the headerText is not missing', () => {
    const props = {
      headerText: 'This is a header',
      onSelectChange: () => {},
      options: [{ displayName: 'This is a test', value: 'test' }],
    };
    const wrapper = shallowWithIntl(<Select {...props} />);
    const header = wrapper.find('h4');
    expect(header.length).to.equal(1);
    expect(header.text()).to.equal(props.headerText);
  });

  it('should not render a h4 element if the headerText is missing', () => {
    const props = {
      onSelectChange: () => {},
      options: [{ displayName: 'This is a test', value: 'test' }],
    };
    const wrapper = shallowWithIntl(<Select {...props} />);
    expect(wrapper.find('h4').length).to.equal(0);
  });
});
