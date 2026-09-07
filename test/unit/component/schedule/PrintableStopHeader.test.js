import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { render } from '@testing-library/react';

import PrintableStopHeader from '../../../../app/component/routepage/schedule/PrintableStopHeader';

describe('<PrintableStopHeader />', () => {
  const defaultProps = {
    fromDisplayName: 'Kamppi',
    toDisplayName: 'Rautatientori',
  };

  it('should render without crashing', () => {
    const { container } = render(<PrintableStopHeader {...defaultProps} />);
    expect(container.querySelector('.printable-stop-header')).to.not.equal(
      null,
    );
  });

  it('should display origin stop name', () => {
    const { container } = render(<PrintableStopHeader {...defaultProps} />);
    expect(
      container.querySelector('.printable-stop-header_from').textContent,
    ).to.equal('Kamppi');
  });

  it('should display destination stop name', () => {
    const { container } = render(<PrintableStopHeader {...defaultProps} />);
    expect(
      container.querySelector('.printable-stop-header_to').textContent,
    ).to.equal('Rautatientori');
  });

  it('should display both stop names with special characters', () => {
    const props = {
      fromDisplayName: 'Käpylä (Helsinki)',
      toDisplayName: 'Töölö / Tölö',
    };
    const { container } = render(<PrintableStopHeader {...props} />);

    expect(
      container.querySelector('.printable-stop-header_from').textContent,
    ).to.equal('Käpylä (Helsinki)');
    expect(
      container.querySelector('.printable-stop-header_to').textContent,
    ).to.equal('Töölö / Tölö');
  });
});
