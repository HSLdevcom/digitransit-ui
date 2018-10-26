import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import {
  PrintableLeg,
  TransferMap,
} from '../../app/component/PrintableItinerary';

import dcw28 from './test-data/dcw28';
import dt2587 from './test-data/dt2587';

describe('<PrintableLeg />', () => {
  it('should not render the same TransferMap twice for a short walk-only leg', () => {
    const props = {
      ...dt2587,
      context: { config: {} },
      index: 0,
    };

    const wrapper = shallowWithIntl(<PrintableLeg {...props} />, {
      context: mockContext,
      childContextTypes: mockChildContextTypes,
    });

    expect(wrapper.find(TransferMap)).to.have.lengthOf(1);
  });

  it('should tell the user to return a rented bike to the starting point station', () => {
    const props = {
      ...dcw28,
      context: { config: {} },
    };

    const wrapper = shallowWithIntl(<PrintableLeg {...props} />, {
      context: mockContext,
      childContextTypes: mockChildContextTypes,
    });

    expect(wrapper.find({ id: 'return-cycle-to' })).to.have.lengthOf(1);
  });
});
