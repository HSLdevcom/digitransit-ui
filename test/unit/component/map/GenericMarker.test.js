import React from 'react';

import { shallowWithIntl } from '../../helpers/mock-intl-enzyme';
import { Component as GenericMarker } from '../../../../app/component/map/GenericMarker';

describe('<GenericMarker />', () => {
  it('should render', () => {
    const props = {
      getIcon: () => {},
      leaflet: {
        map: {
          getZoom: () => {},
          off: () => {},
          on: () => {},
        },
      },
      position: {
        lat: 60,
        lon: 25,
      },
    };
    const wrapper = shallowWithIntl(<GenericMarker {...props} />, {
      context: {
        config: {
          map: {
            genericMarker: {
              popup: {},
            },
          },
        },
      },
    });
    expect(wrapper.isEmptyRender()).to.equal(false);
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
    const wrapper = shallowWithIntl(<GenericMarker {...props} />, {
      context: {
        config: {
          map: {
            genericMarker: {
              popup: {},
            },
          },
        },
      },
    });
    expect(wrapper.isEmptyRender()).to.equal(true);
  });
});
