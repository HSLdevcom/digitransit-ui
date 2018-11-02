import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import Icon from '../../../app/component/Icon';
import Modal from '../../../app/component/Modal';

describe('<Modal />', () => {
  it('should set pointerEvents on for the close icon', () => {
    const wrapper = shallowWithIntl(<Modal toggleVisibility={() => {}} />);
    const icon = wrapper.find(Icon);
    expect(icon.props().pointerEvents).to.equal(true);
  });
});
