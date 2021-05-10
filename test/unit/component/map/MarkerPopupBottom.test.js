import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mountWithIntl } from '../../helpers/mock-intl-enzyme';
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

    const wrapper = mountWithIntl(
      <MarkerPopupBottomWithoutLeaflet {...props} />,
      {},
    );

    expect(wrapper.find('.route-add-viapoint').length).to.equal(0);
  });
});
