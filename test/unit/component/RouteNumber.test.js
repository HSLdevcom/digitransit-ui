import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import RouteNumber from '../../../app/component/RouteNumber';

describe('<RouteNumber />', () => {
  it('should use an icon based on the mode', () => {
    const props = {
      mode: 'CITYBIKE',
    };
    const { container } = renderWithProviders(<RouteNumber {...props} />);
    expect(container.querySelector('use').getAttribute('xlink:href')).to.equal(
      '#icon_citybike',
    );
  });

  it('should use the given icon', () => {
    const props = {
      icon: 'icon_scooter',
      mode: 'CITYBIKE',
    };
    const { container } = renderWithProviders(<RouteNumber {...props} />);
    expect(container.querySelector('use').getAttribute('xlink:href')).to.equal(
      '#icon_scooter',
    );
  });

  it('should use the given icon when there is a disruption', () => {
    const props = {
      hasDisruption: true,
      icon: 'icon_scooter',
      mode: 'CITYBIKE',
    };
    const { container } = renderWithProviders(<RouteNumber {...props} />);
    expect(container.querySelector('use').getAttribute('xlink:href')).to.equal(
      '#icon_scooter',
    );
  });

  it('should use the given icon when there is a call agency', () => {
    const props = {
      icon: 'icon_scooter',
      isCallAgency: true,
      mode: 'CITYBIKE',
    };
    const { container } = renderWithProviders(<RouteNumber {...props} />);
    expect(container.querySelector('use').getAttribute('xlink:href')).to.equal(
      '#icon_scooter',
    );
  });
});
