import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import ZoneIcon from '../../../app/component/ZoneIcon';

const opts = {
  config: { CONFIG: 'hsl', URL: {}, unknownZones: ['FOO'] },
  messages: { 'zone-unknown': 'Unknown zone', 'zone-info': 'Zone {zone}' },
};

describe('<ZoneIcon />', () => {
  it('should not render if zoneId is missing', () => {
    const { container } = renderWithProviders(<ZoneIcon />, opts);
    expect(container.querySelector('.zone-icon-container')).to.equal(null);
  });

  it('should not render unknown zone if the unknown zones should not be shown', () => {
    const { container } = renderWithProviders(
      <ZoneIcon zoneId="FOO" showUnknown={false} />,
      opts,
    );
    expect(container.querySelector('.zone-icon-container')).to.equal(null);
  });

  it('should render a placeholder if the zone is unknown', () => {
    const { container } = renderWithProviders(
      <ZoneIcon zoneId="FOO" showUnknown />,
      opts,
    );
    expect(container.querySelector('.unknown').textContent).to.equal('?');
  });

  it('should render known zone with correct text', () => {
    const { container } = renderWithProviders(<ZoneIcon zoneId="A" />, opts);
    expect(container.querySelector('.circle').textContent).to.equal('A');
  });

  it('should add multi-letter classes for multi-character zoneId', () => {
    const { container } = renderWithProviders(<ZoneIcon zoneId="AB" />, opts);
    expect(container.querySelector('.multi-letter-container')).to.not.equal(
      null,
    );
    expect(container.querySelector('.multi-letter')).to.not.equal(null);
  });

  it('should not add multi-letter class for single-character zoneId', () => {
    const { container } = renderWithProviders(<ZoneIcon zoneId="A" />, opts);
    expect(container.querySelector('.multi-letter')).to.equal(null);
  });

  it('should add unknown-container class for unknown zone', () => {
    const { container } = renderWithProviders(
      <ZoneIcon zoneId="FOO" showUnknown />,
      opts,
    );
    expect(container.querySelector('.unknown-container')).to.not.equal(null);
  });

  it('should render screen reader text for known zone', () => {
    const { container } = renderWithProviders(<ZoneIcon zoneId="B" />, opts);
    expect(container.querySelector('.sr-only').textContent).to.equal('Zone B');
  });

  it('should render screen reader text for unknown zone', () => {
    const { container } = renderWithProviders(
      <ZoneIcon zoneId="FOO" showUnknown />,
      opts,
    );
    expect(container.querySelector('.sr-only').textContent).to.equal(
      'Unknown zone',
    );
  });

  it('should apply custom className', () => {
    const { container } = renderWithProviders(
      <ZoneIcon zoneId="A" className="my-custom" />,
      opts,
    );
    const root = container.querySelector('.zone-icon-container');
    expect(root.classList.contains('my-custom')).to.equal(true);
  });
});
