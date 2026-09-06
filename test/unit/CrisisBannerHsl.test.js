import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { ConfigProvider } from '../../app/configurations/ConfigContext';
import CrisisBannerHsl from '../../app/component/CrisisBannerHsl';

const primaryBanner = { body: 'Primary alert', priority: 'Primary' };
const secondaryBanner = { body: 'Secondary alert', priority: 'Secondary' };

const baseConfig = {
  CONFIG: 'hsl',
  URL: { BANNERS: null },
};

const renderWithBanners = (banners = []) => {
  const { container } = render(
    <IntlProvider locale="fi" messages={{}}>
      <ConfigProvider value={baseConfig}>
        <CrisisBannerHsl initialBanners={banners} />
      </ConfigProvider>
    </IntlProvider>,
  );
  return container;
};

describe('<CrisisBannerHsl />', () => {
  it('renders nothing when no banners are provided', () => {
    const container = renderWithBanners([]);
    expect(container.firstChild).toBe(null);
  });

  it('renders the correct number of banners', () => {
    const container = renderWithBanners([primaryBanner, secondaryBanner]);
    expect(container.querySelectorAll('.crisis-banners-banner')).toHaveLength(
      2,
    );
  });

  it('renders primary banner with the alert icon', () => {
    const container = renderWithBanners([primaryBanner]);
    expect(container.querySelector('.crisis-banners-banner-primary')).not.toBe(
      null,
    );
    expect(
      container.querySelector('.crisis-banners-banner-primary-icon'),
    ).not.toBe(null);
  });

  it('renders secondary banner without the alert icon', () => {
    const container = renderWithBanners([secondaryBanner]);
    expect(
      container.querySelector('.crisis-banners-banner-secondary'),
    ).not.toBe(null);
    expect(container.querySelector('.crisis-banners-banner-primary-icon')).toBe(
      null,
    );
  });

  it('renders banner body as HTML', () => {
    const container = renderWithBanners([
      { body: '<b>Alert!</b>', priority: 'Secondary' },
    ]);
    expect(container.querySelector('b')).not.toBe(null);
    expect(container.querySelector('b').textContent).toBe('Alert!');
  });
});
