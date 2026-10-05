import React from 'react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { Component as NearYouFavouritesContainer } from '../../../../app/component/nearyou/NearYouFavouritesContainer';

const searchPosition = { lat: 60.17, lon: 24.94 };

describe('<NearYouFavouritesContainer />', () => {
  it('shows the no-favourites guidance when every favourite is stale', () => {
    const { container } = renderWithProviders(
      <NearYouFavouritesContainer
        stops={[null]}
        stations={[null]}
        vehicleStations={[null]}
        searchPosition={searchPosition}
        isParentTabActive
        currentTime={0}
      />,
    );
    expect(container.querySelector('.no-favourites-container')).not.toBeNull();
  });

  it('renders nothing extra when there are no favourites at all', () => {
    const { container } = renderWithProviders(
      <NearYouFavouritesContainer
        stops={[]}
        stations={[]}
        vehicleStations={[]}
        searchPosition={searchPosition}
        isParentTabActive
        currentTime={0}
      />,
    );
    expect(container.querySelector('.no-favourites-container')).not.toBeNull();
  });
});
