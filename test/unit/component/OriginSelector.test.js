import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as OriginSelector } from '../../../app/component/OriginSelector';
import OriginSelectorRow from '../../../app/component/OriginSelectorRow';
import GeopositionSelector from '../../../app/component/GeopositionSelector';
import { createMemoryMockRouter } from '../helpers/mock-router';
import { mockContext, mockChildContextTypes } from '../helpers/mock-context';

describe('<OriginSelector />', () => {
  const router = createMemoryMockRouter();
  router.replace = location => {
    router.location = location;
  };
  router.location = {
    pathname: '/',
    search: '?modes=BICYCLE',
  };

  const props = {
    favouriteLocations: [],
    favouriteStops: [],
    oldSearches: [],
    destination: { ready: false },
    origin: { ready: false },
    tab: 'test-tab',
  };
  const context = {
    ...mockContext,
    config: {
      ...mockContext.config,
      defaultOrigins: [
        {
          icon: 'icon-icon_rail',
          label: 'Rautatieasema, Helsinki',
          lat: 60.1710688,
          lon: 24.9414841,
        },
        {
          icon: 'icon-icon_airplane',
          label: 'Lentoasema, Vantaa',
          lat: 60.317429,
          lon: 24.9690395,
        },
        {
          icon: 'icon-icon_bus',
          label: 'Kampin bussiterminaali, Helsinki',
          lat: 60.16902,
          lon: 24.931702,
        },
      ],
    },
    router,
  };
  it('Should provide current location selection', () => {
    const wrapper = mountWithIntl(<OriginSelector {...props} />, {
      context,
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(wrapper.find(GeopositionSelector)).to.have.lengthOf(1);
  });

  it('Should provide at least as many choices as configured in default origins', () => {
    const wrapper = mountWithIntl(<OriginSelector {...props} />, {
      context,
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(wrapper.find(OriginSelectorRow)).to.have.lengthOf.above(3);
  });

  it('Should pass all relevant navigation parameters on selection', () => {
    // regression test: navigation after selection used to erase all existing url params
    const wrapper = mountWithIntl(<OriginSelector {...props} />, {
      context,
      childContextTypes: { ...mockChildContextTypes },
    });
    const item = wrapper
      .find(OriginSelectorRow)
      .last()
      .find('button');

    item.simulate('click'); // select last item

    expect(router.location.search).to.have.string('BICYCLE');
    expect(router.location.pathname).to.have.string('test-tab');
  });
});
