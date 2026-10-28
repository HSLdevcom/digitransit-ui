import React from 'react';
import { LeafletProvider } from 'react-leaflet/es/context';
import { renderWithProviders } from '../../helpers/mock-providers';
import MarkerPopupBottom from '../../../../app/component/map/MarkerPopupBottom';

describe('<MarkerPopupBottom />', () => {
  it('should render a viapoint button when asked so', () => {
    const props = {
      location: {},
      locationPopup: 'all',
      onSelectLocation: () => null,
    };
    const map = { closePopup: () => {} };
    const { container } = renderWithProviders(
      <LeafletProvider value={{ map }}>
        <MarkerPopupBottom {...props} />
      </LeafletProvider>,
    );
    expect(container.querySelector('.route-add-viapoint')).not.toBeNull();
  });
});
