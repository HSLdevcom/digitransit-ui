import React from 'react';
import { renderWithProviders } from './helpers/mock-providers';
import LogoSmall from '../../app/component/LogoSmall';

describe('<LogoSmall />', () => {
  it('should show logo image', () => {
    const { container } = renderWithProviders(<LogoSmall logo="/" />, {
      config: { CONFIG: 'default', URL: {}, textLogo: false },
    });
    expect(container.querySelector('span.title')).toBeNull();
    expect(container.querySelector('div.logo')).not.toBeNull();
  });

  it('should always show text logo when textLogo is true and no logo', () => {
    const { container } = renderWithProviders(<LogoSmall />, {
      config: { CONFIG: 'default', URL: {}, textLogo: true },
    });
    expect(container.querySelector('span.title')).not.toBeNull();
    expect(container.querySelector('div.logo')).toBeNull();
  });

  it('should show the given title text', () => {
    const { container } = renderWithProviders(<LogoSmall />, {
      config: {
        CONFIG: 'default',
        URL: {},
        textLogo: true,
        title: 'Reittiopas',
      },
    });
    const titleElement = container.querySelector('span.title');
    expect(titleElement).not.toBeNull();
    expect(titleElement.textContent).toBe('Reittiopas');
    expect(container.querySelector('div.logo')).toBeNull();
  });

  it('should show the title with the logo', () => {
    const { container } = renderWithProviders(<LogoSmall logo="/" />, {
      config: { CONFIG: 'default', URL: {}, textLogo: true, title: 'foo' },
    });
    expect(container.querySelector('.title').textContent).toBe('foo');
    expect(container.querySelector('div.logo')).not.toBeNull();
  });
});
