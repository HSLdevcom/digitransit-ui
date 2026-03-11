import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow } from 'enzyme';

import PrintableStopHeader from '../../../../app/component/routepage/schedule/PrintableStopHeader';

describe('<PrintableStopHeader />', () => {
  const defaultProps = {
    fromDisplayName: 'Kamppi',
    toDisplayName: 'Rautatientori',
  };

  it('should render without crashing', () => {
    const wrapper = shallow(<PrintableStopHeader {...defaultProps} />);
    expect(wrapper.exists()).to.equal(true);
  });

  it('should display origin stop name', () => {
    const wrapper = shallow(<PrintableStopHeader {...defaultProps} />);
    expect(wrapper.text()).to.include('Kamppi');
  });

  it('should display destination stop name', () => {
    const wrapper = shallow(<PrintableStopHeader {...defaultProps} />);
    expect(wrapper.text()).to.include('Rautatientori');
  });

  it('should display both stop names with special characters', () => {
    const props = {
      fromDisplayName: 'Käpylä (Helsinki)',
      toDisplayName: 'Töölö / Tölö',
    };
    const wrapper = shallow(<PrintableStopHeader {...props} />);

    expect(wrapper.text()).to.include('Käpylä (Helsinki)');
    expect(wrapper.text()).to.include('Töölö / Tölö');
  });
});
