import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { renderWithProviders } from './helpers/mock-providers';
import AppBarHsl from '../../app/component/AppBarHsl';

describe('<AppBarHsl />', () => {
  it('should render without errors', () => {
    const { container } = renderWithProviders(<AppBarHsl />, {
      config: {
        CONFIG: 'default',
        allowLogin: false,
        URL: { ROOTLINK: 'http://www.foo.com' },
        user: {},
      },
    });
    expect(container).to.not.equal(null);
  });
});
