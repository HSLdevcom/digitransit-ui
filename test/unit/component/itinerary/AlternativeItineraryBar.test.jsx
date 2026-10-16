import React from 'react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import AlternativeItineraryBar from '../../../../app/component/itinerary/AlternativeItineraryBar';

const baseProps = {
  selectStreetMode: () => {},
};

describe('<AlternativeItineraryBar />', () => {
  it('renders the one-way-journey notice when config.emphasizeOneWayJourney is set', () => {
    const { container } = renderWithProviders(
      <AlternativeItineraryBar {...baseProps} />,
      { config: createTestConfig({ emphasizeOneWayJourney: true }) },
    );
    expect(container.textContent).toContain('one-way journey');
  });

  it('does not render the one-way-journey notice by default', () => {
    const { container } = renderWithProviders(
      <AlternativeItineraryBar {...baseProps} />,
      { config: createTestConfig() },
    );
    expect(container.textContent).not.toContain('one-way journey');
  });

  it('shows the weather info when weatherData has a temperature', () => {
    const { container } = renderWithProviders(
      <AlternativeItineraryBar
        {...baseProps}
        weatherData={{ temperature: 5, windSpeed: 1, iconId: 1 }}
      />,
      { config: createTestConfig() },
    );
    expect(
      container.querySelector('.street-mode-selector-weather-container'),
    ).not.toBeNull();
  });

  it('hides the content row and shows the active shimmer while loading', () => {
    const { container } = renderWithProviders(
      <AlternativeItineraryBar
        {...baseProps}
        loading
        weatherData={{ temperature: 5, windSpeed: 1, iconId: 1 }}
      />,
      { config: createTestConfig() },
    );
    expect(
      container.querySelector('.street-mode-selector-shimmer-active'),
    ).not.toBeNull();
    expect(
      container.querySelector('.street-mode-selector-weather-container'),
    ).toBeNull();
  });
});
