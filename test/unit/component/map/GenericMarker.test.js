import React from 'react';
import { LeafletProvider } from 'react-leaflet/es/context';
import { renderWithProviders } from '../../helpers/mock-providers';
import { mockContext } from '../../helpers/mock-context';
import { Component as GenericMarker } from '../../../../app/component/map/GenericMarker';

describe('<GenericMarker />', () => {
  it('should render', () => {
    const getIcon = vi.fn();
    const map = {
      addLayer: () => {},
      getZoom: () => 12,
      off: () => {},
      on: () => {},
      removeLayer: () => {},
    };
    const props = {
      getIcon,
      leaflet: { map },
      position: {
        lat: 60,
        lon: 25,
      },
    };
    renderWithProviders(
      <LeafletProvider value={{ map }}>
        <GenericMarker {...props} />
      </LeafletProvider>,
      {
        config: {
          ...mockContext.config,
          map: { genericMarker: { popup: {} } },
        },
      },
    );
    expect(getIcon).toHaveBeenCalledOnce();
    expect(getIcon.mock.calls[0][0]).toBe(12);
  });

  it('should render empty if shouldRender returns false for the current zoom level', () => {
    const props = {
      getIcon: () => {},
      leaflet: {
        map: {
          getZoom: () => 10,
          off: () => {},
          on: () => {},
        },
      },
      position: {
        lat: 60,
        lon: 25,
      },
      shouldRender: zoom => zoom !== 10,
    };
    const { container } = renderWithProviders(<GenericMarker {...props} />, {
      config: {
        ...mockContext.config,
        map: { genericMarker: { popup: {} } },
      },
    });
    expect(container.innerHTML).toBe('');
  });
});
