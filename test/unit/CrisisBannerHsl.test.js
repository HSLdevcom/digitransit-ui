import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { expect } from 'chai';
import { describe, it } from 'mocha';

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
    expect(container.firstChild).to.equal(null);
  });

  it('renders the correct number of banners', () => {
    const container = renderWithBanners([primaryBanner, secondaryBanner]);
    expect(
      container.querySelectorAll('.crisis-banners-banner'),
    ).to.have.lengthOf(2);
  });

  it('renders primary banner with the alert icon', () => {
    const container = renderWithBanners([primaryBanner]);
    expect(
      container.querySelector('.crisis-banners-banner-primary'),
    ).to.not.equal(null);
    expect(
      container.querySelector('.crisis-banners-banner-primary-icon'),
    ).to.not.equal(null);
  });

  it('renders secondary banner without the alert icon', () => {
    const container = renderWithBanners([secondaryBanner]);
    expect(
      container.querySelector('.crisis-banners-banner-secondary'),
    ).to.not.equal(null);
    expect(
      container.querySelector('.crisis-banners-banner-primary-icon'),
    ).to.equal(null);
  });

  it('renders banner body as HTML', () => {
    const container = renderWithBanners([
      { body: '<b>Alert!</b>', priority: 'Secondary' },
    ]);
    expect(container.querySelector('b')).to.not.equal(null);
    expect(container.querySelector('b').textContent).to.equal('Alert!');
  });
});
