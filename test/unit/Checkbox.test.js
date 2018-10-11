import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { mountWithIntl } from './helpers/mock-intl-enzyme';
import Checkbox from '../../app/component/Checkbox';
import Message from '../../app/component/Message';

describe('<Checkbox />', () => {
  it('should render a checkbox', () => {
    const props = {
      onChange: () => {},
    };
    const wrapper = mountWithIntl(<Checkbox {...props} />);
    expect(wrapper.length).to.equal(1);
  });

  it('should show the given label', () => {
    const props = {
      labelId: 'citybike',
      onChange: () => {},
      showLabel: true,
    };
    const wrapper = mountWithIntl(<Checkbox {...props} />);
    expect(wrapper.length).to.equal(1);
    const label = wrapper.find(FormattedMessage);
    expect(label.length).to.equal(1);
    expect(label.text()).to.equal('City bike');
  });

  it('Should work also without labelId', () => {
    const props = {
      defaultMessage: 'ei tarvitse kääntää',
      onChange: () => {},
      showLabel: true,
    };
    const wrapper = mountWithIntl(<Checkbox {...props} />);
    expect(wrapper.length).to.equal(1);
    const label = wrapper.find(Message);
    expect(label.length).to.equal(1);
    expect(label.text()).to.have.string('ei tarvitse kääntää');
  });

  it('should invoke onChange', () => {
    let wasCalled = false;
    const props = {
      onChange: () => {
        wasCalled = true;
      },
    };

    const wrapper = mountWithIntl(<Checkbox {...props} />);
    wrapper.find('input').simulate('change');
    expect(wasCalled).to.equal(true);
  });

  it('should not invoke onChange when disabled', () => {
    let wasCalled = false;
    const props = {
      disabled: true,
      onChange: () => {
        wasCalled = true;
      },
    };

    const wrapper = mountWithIntl(<Checkbox {...props} />);
    wrapper.find('input').simulate('change');
    expect(wasCalled).to.equal(false);
  });

  it('wrapping element should mimic a checkbox event on keypress', () => {
    let wasCalled = false;
    const props = {
      checked: true,
      onChange: e => {
        wasCalled = true;
        expect(e.target.checked).to.equal(false);
      },
    };

    const wrapper = mountWithIntl(<Checkbox {...props} />);
    wrapper.find('.option-checkbox').simulate('keypress', { key: 'Enter' });
    expect(wasCalled).to.equal(true);
  });
});
