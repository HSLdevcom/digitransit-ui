import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { createTestConfig } from '../../../helpers/mock-context';
import NaviStarter from '../../../../../app/component/itinerary/navigator/NaviStarter';

const baseConfig = createTestConfig();

describe('<NaviStarter />', () => {
  it('shows the early-start prompt before the itinerary start time', () => {
    const { container } = renderWithProviders(
      <NaviStarter
        time="10:00"
        startItinerary={() => {}}
        isPastStart={false}
      />,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('10:00');
    expect(
      container.querySelector('.navi-initializer-card.success'),
    ).not.toBeNull();
  });

  it('renders nothing once the itinerary has already started', () => {
    const { container } = renderWithProviders(
      <NaviStarter time="10:00" startItinerary={() => {}} isPastStart />,
      { config: baseConfig },
    );
    expect(container.querySelector('.navi-initializer-container')).toBeNull();
  });

  it('calls startItinerary once the slide-out animation ends', () => {
    const startItinerary = vi.fn();
    const { container } = renderWithProviders(
      <NaviStarter
        time="10:00"
        startItinerary={startItinerary}
        isPastStart={false}
      />,
      { config: baseConfig },
    );
    fireEvent.animationEnd(
      container.querySelector('.navi-initializer-container'),
    );
    expect(startItinerary).toHaveBeenCalledTimes(1);
  });
});
