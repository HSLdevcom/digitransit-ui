import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import data from './test-data/dcw31';
import { renderWithProviders } from './helpers/mock-providers';
import ItinerarySummary from '../../app/component/itinerary/ItinerarySummary';

describe('<ItinerarySummary />', () => {
  it('should show biking distance and walking distance', () => {
    const props = {
      children: <div />,
      itinerary: data.bikingAndWalking,
      biking: { distance: 1000, duration: 180 },
      walking: { distance: 555, duration: 300 },
    };
    const { container } = renderWithProviders(<ItinerarySummary {...props} />);
    expect(
      container.querySelectorAll('.distance--itinerary-summary'),
    ).to.have.lengthOf(2);
  });

  it('should show walking distance before biking distance', () => {
    const props = {
      children: <div />,
      itinerary: data.bikingAndWalking,
      biking: { distance: 1000, duration: 180 },
      walking: { distance: 555, duration: 300 },
    };
    const { container } = renderWithProviders(<ItinerarySummary {...props} />);
    const items = container.querySelectorAll('.distance--itinerary-summary');
    expect(items[0].querySelector('.icon.walk')).to.not.equal(null);
    expect(items[items.length - 1].querySelector('.icon.bike')).to.not.equal(
      null,
    );
  });

  it('should show only biking distance for only biking itinerary', () => {
    const props = {
      children: <div />,
      itinerary: data.onlyBiking,
      biking: { distance: 1000, duration: 180 },
    };
    const { container } = renderWithProviders(<ItinerarySummary {...props} />);
    expect(
      container.querySelectorAll('.distance--itinerary-summary'),
    ).to.have.lengthOf(1);
    expect(container.querySelector('.icon.bike')).to.not.equal(null);
    expect(container.querySelector('.icon.walk')).to.equal(null);
  });
});
