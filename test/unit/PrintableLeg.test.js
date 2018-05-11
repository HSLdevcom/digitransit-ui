import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import {
  PrintableLeg,
  TransferMap,
} from '../../app/component/PrintableItinerary';

import data from './test-data/dt2587';

describe('PrintableLeg', () => {
  it('should not render the same TransferMap twice for a short walk-only leg', () => {
    const props = {
      ...data,
      context: { config: {} },
    };

    const wrapper = shallowWithIntl(<PrintableLeg {...props} />, {
      context: mockContext,
      childContextTypes: mockChildContextTypes,
    });

    expect(wrapper.find(TransferMap)).to.have.lengthOf(1);
  });
});
