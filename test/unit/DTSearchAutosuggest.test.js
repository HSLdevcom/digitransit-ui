import PropTypes from 'prop-types';
import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import { mountWithIntl } from './helpers/mock-intl-enzyme';
import DTSearchAutosuggest from '../../app/component/DTSearchAutosuggest';

describe('<DTSearchAutosuggest />', () => {
  it('should render with focus set', () => {
    const props = {
      autoFocus: true,
      id: 'origin',
      layers: [],
      placeholder: 'search-origin',
      refPoint: {},
      searchType: 'all',
      selectedFunction: () => {},
    };
    const wrapper = mountWithIntl(<DTSearchAutosuggest {...props} />, {
      context: { ...mockContext, config: {} },
      childContextTypes: {
        ...mockChildContextTypes,
        config: PropTypes.object,
      },
    });
    const focusedElement = document.activeElement;

    expect(wrapper.find('input').instance()).to.equal(focusedElement);
  });
});
