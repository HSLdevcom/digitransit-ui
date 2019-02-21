import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import Modal from '../../../app/component/Modal';

describe('<Modal />', () => {
  it('should render', () => {
    const wrapper = shallowWithIntl(<Modal toggleVisibility={() => {}} />);
    expect(wrapper.isEmptyRender()).to.equal(false);
  });
});
