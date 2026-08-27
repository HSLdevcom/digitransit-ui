import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { render } from '@testing-library/react';
import { ConfigProvider } from '../../app/configurations/ConfigContext';
import LogoSmall from '../../app/component/LogoSmall';

const renderWithConfig = (ui, config) =>
  render(
    <ConfigProvider value={{ CONFIG: 'default', URL: {}, ...config }}>
      {ui}
    </ConfigProvider>,
  );

describe('<LogoSmall />', () => {
  it('should show logo image', () => {
    const { container } = renderWithConfig(<LogoSmall logo="/" />, {
      textLogo: false,
    });
    expect(container.querySelector('span.title')).to.equal(null);
    expect(container.querySelector('div.logo')).to.not.equal(null);
  });

  it('should always show text logo when textLogo is true and no logo', () => {
    const { container } = renderWithConfig(<LogoSmall />, {
      textLogo: true,
    });
    expect(container.querySelector('span.title')).to.not.equal(null);
    expect(container.querySelector('div.logo')).to.equal(null);
  });

  it('should show the given title text', () => {
    const { container } = renderWithConfig(<LogoSmall title="Reittiopas" />, {
      textLogo: true,
    });
    const titleElement = container.querySelector('span.title');
    expect(titleElement).to.not.equal(null);
    expect(titleElement.textContent).to.equal('Reittiopas');
    expect(container.querySelector('div.logo')).to.equal(null);
  });

  it('should show the title with the logo', () => {
    const { container } = renderWithConfig(<LogoSmall logo="/" title="foo" />, {
      textLogo: true,
    });
    expect(container.querySelector('.title').textContent).to.equal('foo');
    expect(container.querySelector('div.logo')).to.not.equal(null);
  });
});
