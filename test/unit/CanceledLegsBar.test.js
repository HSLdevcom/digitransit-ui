import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import { mockContext } from './helpers/mock-context';

import { component as CanceledLegsBar } from '../../app/component/CanceledLegsBar';

describe('<CanceledLegsBar />', () => {
  it('should render the banner if there are canceled legs', () => {
    const props = {
      showCanceledLegsBanner: true,
    };
    const wrapper = shallowWithIntl(<CanceledLegsBar {...props} />, {
      context: { ...mockContext },
    });
    expect(
      wrapper.find('.canceled-legs-banner').prop('style'),
    ).to.have.property('display', 'block');
  });
});
