import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { renderWithProviders } from '../../helpers/mock-providers';
import { Component as MarkerPopupBottomWithoutLeaflet } from '../../../../app/component/map/MarkerPopupBottom';

describe('<MarkerPopupBottom />', () => {
  it('should render a viapoint button when asked so', () => {
    const props = {
      location: {},
      leaflet: {
        map: {
          closePopup: () => {},
        },
      },
      locationPopup: 'all',
      onSelectLocation: () => null,
    };
    const { container } = renderWithProviders(
      <MarkerPopupBottomWithoutLeaflet {...props} />,
    );
    expect(container.querySelector('.route-add-viapoint')).to.not.equal(null);
  });
});
