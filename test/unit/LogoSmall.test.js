import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { renderWithProviders } from './helpers/mock-providers';
import LogoSmall from '../../app/component/LogoSmall';

describe('<LogoSmall />', () => {
  it('should show logo image', () => {
    const { container } = renderWithProviders(<LogoSmall logo="/" />, {
      config: { CONFIG: 'default', URL: {}, textLogo: false },
    });
    expect(container.querySelector('span.title')).to.equal(null);
    expect(container.querySelector('div.logo')).to.not.equal(null);
  });

  it('should always show text logo when textLogo is true and no logo', () => {
    const { container } = renderWithProviders(<LogoSmall />, {
      config: { CONFIG: 'default', URL: {}, textLogo: true },
    });
    expect(container.querySelector('span.title')).to.not.equal(null);
    expect(container.querySelector('div.logo')).to.equal(null);
  });

  it('should show the given title text', () => {
    const { container } = renderWithProviders(
      <LogoSmall title="Reittiopas" />,
      { config: { CONFIG: 'default', URL: {}, textLogo: true } },
    );
    const titleElement = container.querySelector('span.title');
    expect(titleElement).to.not.equal(null);
    expect(titleElement.textContent).to.equal('Reittiopas');
    expect(container.querySelector('div.logo')).to.equal(null);
  });

  it('should show the title with the logo', () => {
    const { container } = renderWithProviders(
      <LogoSmall logo="/" title="foo" />,
      { config: { CONFIG: 'default', URL: {}, textLogo: true } },
    );
    expect(container.querySelector('.title').textContent).to.equal('foo');
    expect(container.querySelector('div.logo')).to.not.equal(null);
  });
});
