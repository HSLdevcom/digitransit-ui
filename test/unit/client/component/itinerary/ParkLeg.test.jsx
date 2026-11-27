import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { createTestConfig } from '../../../helpers/mock-context';
import ParkLeg from '../../../../../src/client/component/itinerary/ParkLeg';

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
  park: { vehicleParkingId: 'HSL:1', name: 'Pysäköinti' },
};

describe('<ParkLeg />', () => {
  it('renders the park & ride instructions and the car park name', () => {
    const { container } = renderWithProviders(<ParkLeg {...baseProps} type="car" />, {
      config: baseConfig,
    });
    expect(container.textContent).toContain('Park & ride');
    expect(container.textContent).toContain('Pysäköinti');
  });

  it('uses the bike park label for bike parks', () => {
    const { container } = renderWithProviders(<ParkLeg {...baseProps} type="bike" />, {
      config: baseConfig,
    });
    expect(container.textContent).toContain('Park & Ride for bikes');
  });

  it('applies the configured primary color to the stop icon', () => {
    const { container } = renderWithProviders(<ParkLeg {...baseProps} type="car" />, {
      config: baseConfig,
    });
    expect(container.querySelector('.itinerary-arrow-icon')?.style.fill).toBe(
      baseConfig.colors.primary,
    );
  });

  it('renders the walk distance notice by default', () => {
    const { container } = renderWithProviders(<ParkLeg {...baseProps} type="car" />, {
      config: baseConfig,
    });
    expect(container.textContent).toContain('Walk');
  });

  it('calls focusAction when a map action button is clicked', () => {
    const focusAction = vi.fn();
    const { container } = renderWithProviders(
      <ParkLeg {...baseProps} type="car" focusAction={focusAction} />,
      { config: baseConfig },
    );
    fireEvent.click(container.querySelector('.itinerary-map-action'));
    expect(focusAction).toHaveBeenCalledTimes(1);
  });
});
