import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import PlatformNumber from '../../app/component/PlatformNumber';
import { TransportMode } from '../../app/constants';

const messages = {
  platform: 'Platform',
  'platform-short-no-num': 'Plat.',
  track: 'Track',
  pier: 'Pier',
  'pier-short-no-num': 'Pier',
};

const renderWithIntl = ui =>
  render(
    <IntlProvider locale="en" messages={messages}>
      {ui}
    </IntlProvider>,
  );

describe('<PlatformNumber />', () => {
  it('should render nothing if number is undefined', () => {
    const { container } = renderWithIntl(
      <PlatformNumber short={false} mode={TransportMode.Bus} />,
    );
    expect(container.textContent).to.equal('');
  });

  it('should render platform text when mode is not RAIL or FERRY', () => {
    const { container } = renderWithIntl(
      <PlatformNumber number="12" short={false} mode={TransportMode.Bus} />,
    );
    expect(container.textContent).to.include('Platform');
  });

  it('should render pier text when mode is FERRY', () => {
    const { container } = renderWithIntl(
      <PlatformNumber number="12" short={false} mode={TransportMode.Ferry} />,
    );
    expect(container.textContent).to.include('Pier');
  });

  it('should render track text when mode is RAIL', () => {
    const { container } = renderWithIntl(
      <PlatformNumber number="12" short={false} mode={TransportMode.Rail} />,
    );
    expect(container.textContent).to.include('Track');
  });

  it('should render short platform text when short is true', () => {
    const { container } = renderWithIntl(
      <PlatformNumber number="12" short mode={TransportMode.Bus} />,
    );
    expect(container.textContent).to.include('Plat.');
  });

  it('should use plain class on outer span when plain is true', () => {
    const { container } = renderWithIntl(
      <PlatformNumber
        number="12"
        short={false}
        mode={TransportMode.Bus}
        plain
      />,
    );
    expect(container.querySelector('.platform-number-plain')).to.not.equal(
      null,
    );
    expect(
      container.querySelector('.platform-number:not(.platform-number-plain)'),
    ).to.equal(null);
  });

  it('should show update icon and class when updated is true', () => {
    const { container } = renderWithIntl(
      <PlatformNumber
        number="12"
        short={false}
        mode={TransportMode.Bus}
        updated
      />,
    );
    expect(container.querySelector('.platform-updated')).to.not.equal(null);
    expect(container.querySelector('.platform-updated-icon')).to.not.equal(
      null,
    );
  });

  it('should omit label text when withText is false', () => {
    const { container } = renderWithIntl(
      <PlatformNumber
        number="12"
        short={false}
        mode={TransportMode.Bus}
        withText={false}
      />,
    );
    expect(container.textContent).to.not.include('Platform');
    expect(container.textContent).to.include('12');
  });
});
