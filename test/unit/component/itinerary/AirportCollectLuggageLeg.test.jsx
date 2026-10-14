import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import AirportCollectLuggageLeg from '../../../../app/component/itinerary/AirportCollectLuggageLeg';

const baseConfig = createTestConfig();

describe('<AirportCollectLuggageLeg />', () => {
  const baseProps = {
    index: 0,
    leg: {
      end: { scheduledTime: new Date().toISOString() },
      to: { name: 'Gate B', stop: { gtfsId: 'HSL:5678' } },
    },
  };

  it('renders the luggage collection instructions for the arrival gate', () => {
    const { container } = renderWithProviders(
      <AirportCollectLuggageLeg {...baseProps} focusAction={() => {}} />,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('Gate B');
    expect(container.textContent).toContain('Collect your luggage');
  });

  it('applies the configured primary color to the stop icon', () => {
    const { container } = renderWithProviders(
      <AirportCollectLuggageLeg {...baseProps} focusAction={() => {}} />,
      { config: baseConfig },
    );
    expect(container.querySelector('.itinerary-arrow-icon')?.style.fill).toBe(
      baseConfig.colors.primary,
    );
  });

  it('renders the stop code passed as children', () => {
    const { container } = renderWithProviders(
      <AirportCollectLuggageLeg {...baseProps} focusAction={() => {}}>
        <span>M2</span>
      </AirportCollectLuggageLeg>,
      { config: baseConfig },
    );
    expect(container.querySelector('.stop-code-container').textContent).toBe(
      'M2',
    );
  });

  it('renders an empty stop code container when no children are given', () => {
    const { container } = renderWithProviders(
      <AirportCollectLuggageLeg {...baseProps} focusAction={() => {}} />,
      { config: baseConfig },
    );
    expect(container.querySelector('.stop-code-container').textContent).toBe(
      '',
    );
  });

  it('calls focusAction when the leg row is clicked', () => {
    const focusAction = vi.fn();
    const { container } = renderWithProviders(
      <AirportCollectLuggageLeg {...baseProps} focusAction={focusAction} />,
      { config: baseConfig },
    );
    fireEvent.click(container.querySelector('.itinerary-instruction-column'));
    expect(focusAction).toHaveBeenCalledTimes(1);
  });
});
