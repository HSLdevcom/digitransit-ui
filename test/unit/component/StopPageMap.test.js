import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { Component as StopPageMap } from '../../../app/component/map/StopPageMap';

describe('<StopPageMap />', () => {
  it('should render empty if stop information is missing', () => {
    const props = {
      breakpoint: 'large',
      params: {
        stopId: 'HSL:2211275',
      },
      routes: [],
      stop: null,
      mapLayers: { stop: {}, terminal: {} },
      mapLayerOptions: {},
      locationState: { hasLocation: false },
    };
    const { container } = renderWithProviders(<StopPageMap {...props} />);
    expect(container.querySelector('.map')).to.equal(null);
  });
});
