import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import ViaLeg from '../../../../app/component/itinerary/ViaLeg';

const baseConfig = createTestConfig();

const baseProps = {
  index: 0,
  arrival: { scheduledTime: '2024-04-05T14:00:00.000Z' },
  focusAction: () => {},
  focusToLeg: () => {},
  leg: {
    distance: 150,
    duration: 60,
    mode: 'WALK',
    start: { scheduledTime: '2024-04-05T14:05:00.000Z' },
    from: { name: 'Via Street 1, City' },
    to: {},
  },
};

describe('<ViaLeg />', () => {
  it('renders the via-point address', () => {
    const { container } = renderWithProviders(<ViaLeg {...baseProps} />, {
      config: baseConfig,
    });
    expect(container.textContent).toContain('Via Street 1');
  });

  it('renders children content', () => {
    const { container } = renderWithProviders(
      <ViaLeg {...baseProps}>
        <span>Extra info</span>
      </ViaLeg>,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('Extra info');
  });

  it('formats the distance in kilometers when config.alwaysShowDistanceInKm is set', () => {
    const { container } = renderWithProviders(<ViaLeg {...baseProps} />, {
      config: createTestConfig({ alwaysShowDistanceInKm: true }),
    });
    expect(container.textContent).toContain('0.1  km');
  });

  it('calls focusAction when the via-point map action is clicked', () => {
    const focusAction = vi.fn();
    const { container } = renderWithProviders(
      <ViaLeg {...baseProps} focusAction={focusAction} />,
      { config: baseConfig },
    );
    const [viaPointMapAction] = container.querySelectorAll(
      '.itinerary-map-action',
    );
    fireEvent.click(viaPointMapAction);
    expect(focusAction).toHaveBeenCalledTimes(1);
  });

  it('calls focusToLeg when the leg-description map action is clicked', () => {
    const focusToLeg = vi.fn();
    const { container } = renderWithProviders(
      <ViaLeg {...baseProps} focusToLeg={focusToLeg} />,
      { config: baseConfig },
    );
    const mapActions = container.querySelectorAll('.itinerary-map-action');
    fireEvent.click(mapActions[mapActions.length - 1]);
    expect(focusToLeg).toHaveBeenCalledTimes(1);
  });
});
