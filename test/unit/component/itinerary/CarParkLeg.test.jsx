import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import CarParkLeg from '../../../../app/component/itinerary/CarParkLeg';

const baseConfig = createTestConfig();

const baseProps = {
  index: 0,
  focusAction: () => {},
  leg: {
    distance: 1200,
    duration: 300,
    mode: 'CAR',
    start: { scheduledTime: new Date().toISOString() },
    from: { name: 'Start Street', viaLocationType: null },
    to: { name: 'Park & Ride' },
    isViaPoint: false,
  },
  carPark: { vehicleParkingId: 'HSL:1', name: 'Pysäköinti' },
};

describe('<CarParkLeg />', () => {
  it('renders the park & ride instructions and the car park name', () => {
    const { container } = renderWithProviders(<CarParkLeg {...baseProps} />, {
      config: baseConfig,
    });
    expect(container.textContent).toContain('Park & ride');
    expect(container.textContent).toContain('Pysäköinti');
  });

  it('applies the configured primary color to the stop icon', () => {
    const { container } = renderWithProviders(<CarParkLeg {...baseProps} />, {
      config: baseConfig,
    });
    expect(container.querySelector('.itinerary-arrow-icon')?.style.fill).toBe(
      baseConfig.colors.primary,
    );
  });

  it('renders the walk distance notice by default', () => {
    const { container } = renderWithProviders(<CarParkLeg {...baseProps} />, {
      config: baseConfig,
    });
    expect(container.textContent).toContain('Walk');
  });

  it('hides the walk distance notice when noWalk is set', () => {
    const { container } = renderWithProviders(
      <CarParkLeg {...baseProps} noWalk />,
      { config: baseConfig },
    );
    expect(container.textContent).not.toContain('Walk');
  });

  it('renders the stop code passed as children', () => {
    const { container } = renderWithProviders(
      <CarParkLeg {...baseProps}>
        <span>M1</span>
      </CarParkLeg>,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('M1');
  });

  it('calls focusAction when a map action button is clicked', () => {
    const focusAction = vi.fn();
    const { container } = renderWithProviders(
      <CarParkLeg {...baseProps} focusAction={focusAction} />,
      { config: baseConfig },
    );
    fireEvent.click(container.querySelector('.itinerary-map-action'));
    expect(focusAction).toHaveBeenCalledTimes(1);
  });
});
