import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import CarLeg from '../../../../app/component/itinerary/CarLeg';

const baseConfig = createTestConfig();

const baseProps = {
  index: 0,
  focusAction: () => {},
  focusToLeg: () => {},
  leg: {
    distance: 5000,
    duration: 600,
    mode: 'CAR',
    start: { scheduledTime: new Date().toISOString() },
    from: { name: 'Start Street, City', viaLocationType: null },
    to: {},
    isViaPoint: false,
  },
};

describe('<CarLeg />', () => {
  it('renders the origin address and the drive distance/duration', () => {
    const { container } = renderWithProviders(<CarLeg {...baseProps} />, {
      config: baseConfig,
    });
    expect(container.textContent).toContain('Start Street');
    expect(container.textContent).toContain('Drive');
  });

  // Proves useConfigContext() actually supplies config, driving which message id is used
  it('hides the duration when config.hideCarSuggestionDuration is set', () => {
    const { container } = renderWithProviders(<CarLeg {...baseProps} />, {
      config: createTestConfig({ hideCarSuggestionDuration: true }),
    });
    expect(container.textContent).not.toContain('(');
  });

  it('renders the stop code passed as children', () => {
    const { container } = renderWithProviders(
      <CarLeg {...baseProps}>
        <span>M1</span>
      </CarLeg>,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('M1');
  });

  it('calls focusAction when the address map action is clicked', () => {
    const focusAction = vi.fn();
    const { container } = renderWithProviders(
      <CarLeg {...baseProps} focusAction={focusAction} />,
      { config: baseConfig },
    );
    const [addressMapAction] = container.querySelectorAll(
      '.itinerary-map-action',
    );
    fireEvent.click(addressMapAction);
    expect(focusAction).toHaveBeenCalledTimes(1);
  });

  it('calls focusToLeg when the drive summary map action is clicked', () => {
    const focusToLeg = vi.fn();
    const { container } = renderWithProviders(
      <CarLeg {...baseProps} focusToLeg={focusToLeg} />,
      { config: baseConfig },
    );
    const mapActions = container.querySelectorAll('.itinerary-map-action');
    fireEvent.click(mapActions[mapActions.length - 1]);
    expect(focusToLeg).toHaveBeenCalledTimes(1);
  });
});
