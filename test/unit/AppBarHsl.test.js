import React from 'react';
import { describe, it } from 'vitest';
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
        // Required by the real (unstubbed) @hsl-fi/site-header component -
        // it indexes its own translations object by this value.
        language: 'fi',
      },
    });
    expect(container).not.toBeNull();
  });
});
