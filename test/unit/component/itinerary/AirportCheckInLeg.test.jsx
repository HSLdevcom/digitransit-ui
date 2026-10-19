import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import AirportCheckInLeg from '../../../../app/component/itinerary/AirportCheckInLeg';

const baseConfig = createTestConfig();

describe('<AirportCheckInLeg />', () => {
  const baseProps = {
    index: 0,
    start: { scheduledTime: new Date().toISOString() },
    leg: {
      from: { name: 'Gate A', stop: { gtfsId: 'HSL:1234' } },
    },
  };

  it('renders the check-in instructions for the departure gate', () => {
    const { container } = renderWithProviders(
      <AirportCheckInLeg {...baseProps} focusAction={() => {}} />,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('Gate A');
    expect(container.textContent).toContain('Check-in');
  });

  it('applies the configured primary color to the stop icon', () => {
    const { container } = renderWithProviders(
      <AirportCheckInLeg {...baseProps} focusAction={() => {}} />,
      { config: baseConfig },
    );
    expect(container.querySelector('.itinerary-arrow-icon')?.style.fill).toBe(
      baseConfig.colors.primary,
    );
  });

  it('renders the stop code passed as children', () => {
    const { container } = renderWithProviders(
      <AirportCheckInLeg {...baseProps} focusAction={() => {}}>
        <span>M1</span>
      </AirportCheckInLeg>,
      { config: baseConfig },
    );
    expect(container.querySelector('.stop-code-container').textContent).toBe(
      'M1',
    );
  });

  it('renders an empty stop code container when no children are given', () => {
    const { container } = renderWithProviders(
      <AirportCheckInLeg {...baseProps} focusAction={() => {}} />,
      { config: baseConfig },
    );
    expect(container.querySelector('.stop-code-container').textContent).toBe(
      '',
    );
  });

  it('calls focusAction when the leg row is clicked', () => {
    const focusAction = vi.fn();
    const { container } = renderWithProviders(
      <AirportCheckInLeg {...baseProps} focusAction={focusAction} />,
      { config: baseConfig },
    );
    fireEvent.click(container.querySelector('.itinerary-instruction-column'));
    expect(focusAction).toHaveBeenCalledTimes(1);
  });
});
