import PropTypes from 'prop-types';
import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import { mountWithIntl } from './helpers/mock-intl-enzyme';
import DTAutoSuggest from '../../app/component/DTAutosuggest';
import searchContext from '../../app/util/searchContext';

describe('<DTAutoSuggest />', () => {
  it('should render with focus set', () => {
    const props = {
      config: {},
      searchContext,
      autoFocus: true,
      id: 'origin',
      layers: [],
      placeholder: 'search-origin',
      refPoint: {},
      searchType: 'all',
      selectedFunction: () => {},
      onLocationSelected: () => {},
    };
    const wrapper = mountWithIntl(<DTAutoSuggest {...props} />, {
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
