import React from 'react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { createTestConfig } from '../../helpers/mock-context';
import StreetSummary from '../../../../app/component/itinerary/StreetSummary';

const baseConfig = createTestConfig();

const baseProps = {
  distance: 500,
  duration: 300,
  mode: 'walk',
};

describe('<StreetSummary />', () => {
  it('shows the distance and duration', () => {
    const { container } = renderWithProviders(
      <StreetSummary {...baseProps} />,
      { config: baseConfig },
    );
    expect(container.querySelector('.walk-distance')).not.toBeNull();
    expect(container.querySelector('.walk-distance.no-duration')).toBeNull();
  });

  it('uses the default walk icon when none is given', () => {
    const { container } = renderWithProviders(
      <StreetSummary {...baseProps} />,
      { config: baseConfig },
    );
    expect(container.querySelector('use')?.getAttribute('xlink:href')).toBe(
      '#icon_walk',
    );
  });

  it('uses the given icon when provided', () => {
    const { container } = renderWithProviders(
      <StreetSummary {...baseProps} icon="icon_cyclist" />,
      { config: baseConfig },
    );
    expect(container.querySelector('use')?.getAttribute('xlink:href')).toBe(
      '#icon_cyclist',
    );
  });

  it('hides the duration for a car leg when config.hideCarSuggestionDuration is set', () => {
    const { container } = renderWithProviders(
      <StreetSummary {...baseProps} mode="car" />,
      { config: createTestConfig({ hideCarSuggestionDuration: true }) },
    );
    expect(
      container.querySelector('.walk-distance.no-duration'),
    ).not.toBeNull();
  });
});
