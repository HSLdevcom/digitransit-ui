import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { mockContext } from '../helpers/mock-context';
import { Component as RoutePatternSelect } from '../../../app/component/RoutePatternSelect';
import dt2887 from '../test-data/dt2887';
import dt2887b from '../test-data/dt2887b';

describe('<RoutePatternSelect />', () => {
  it('should render', () => {
    const wrapper = shallowWithIntl(<RoutePatternSelect {...dt2887} />, {
      context: { ...mockContext },
    });
    expect(wrapper.isEmptyRender()).to.equal(false);
  });
  it('should create a select element for more than 2 patterns', () => {
    const wrapper = shallowWithIntl(<RoutePatternSelect {...dt2887} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('#select-route-pattern')).to.have.lengthOf(1);
  });
  it('should create a toggle element if there are only 2 patterns', () => {
    const wrapper = shallowWithIntl(<RoutePatternSelect {...dt2887b} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('.route-patterns-toggle')).to.have.lengthOf(1);
  });
  it('should create as many options as there are patterns', () => {
    const wrapper = shallowWithIntl(<RoutePatternSelect {...dt2887} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('#select-route-pattern > option')).to.have.lengthOf(3);
  });

  it('should render a toggle element with divs if there are no patterns with trips', () => {
    const props = {
      activeTab: 'pysakit',
      gtfsId: 'HSL:3002U',
      onSelectChange: () => {},
      params: {
        patternId: 'HSL:3002U:0:02',
      },
      relay: {
        setVariables: () => {},
      },
      route: {
        patterns: [
          {
            code: 'HSL:3002U:0:01',
            headsign: 'Kauklahti',
            stops: [{ name: 'Helsinki' }, { name: 'Kauklahti' }],
            tripsForDate: [],
          },
          {
            code: 'HSL:3002U:0:02',
            headsign: 'Kirkkonummi',
            stops: [{ name: 'Helsinki' }, { name: 'Kirkkonummi' }],
            tripsForDate: [],
          },
          {
            code: 'HSL:3002U:0:03',
            stops: [{ name: 'Helsinki' }, { name: 'Siuntio' }],
            tripsForDate: [],
          },
        ],
      },
      serviceDay: '20190604',
    };
    const wrapper = shallowWithIntl(<RoutePatternSelect {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('option')).to.have.lengthOf(3);
    expect(wrapper.find('div.route-option-togglable')).to.have.lengthOf(0);
  });

  it('should redirect to the first existing pattern if there is no matching pattern available', () => {
    const props = {
      activeTab: 'pysakit',
      gtfsId: 'HSL:3002U',
      onSelectChange: () => {},
      params: {
        patternId: 'foobar',
      },
      relay: {
        setVariables: () => {},
      },
      route: {
        patterns: [
          {
            code: 'HSL:3002U:0:01',
            headsign: 'Kauklahti',
            stops: [{ name: 'Helsinki' }, { name: 'Kauklahti' }],
            tripsForDate: [{}],
          },
          {
            code: 'HSL:3002U:0:02',
            headsign: 'Kirkkonummi',
            stops: [{ name: 'Helsinki' }, { name: 'Kirkkonummi' }],
            tripsForDate: [{}],
          },
        ],
      },
      serviceDay: '20190604',
    };

    let url;
    shallowWithIntl(<RoutePatternSelect {...props} />, {
      context: {
        ...mockContext,
        router: {
          ...mockContext.router,
          replace: args => {
            url = args;
          },
        },
      },
    });
    expect(url).to.contain(props.gtfsId);
    expect(url).to.contain(props.route.patterns[0].code);
  });

  it('should not crash if there are no patterns with trips available for the current date', () => {
    const props = {
      activeTab: 'pysakit',
      gtfsId: 'HSL:3002U',
      onSelectChange: () => {},
      params: {
        patternId: 'HSL:3002U:0:01',
      },
      relay: {
        setVariables: () => {},
      },
      route: {
        patterns: [
          {
            code: 'HSL:3002U:0:01',
            headsign: 'Kauklahti',
            stops: [{ name: 'Helsinki' }, { name: 'Kauklahti' }],
            tripsForDate: [],
          },
          {
            code: 'HSL:3002U:0:02',
            headsign: 'Kirkkonummi',
            stops: [{ name: 'Helsinki' }, { name: 'Kirkkonummi' }],
            tripsForDate: [],
          },
        ],
      },
      serviceDay: '20190604',
    };

    const wrapper = shallowWithIntl(<RoutePatternSelect {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.isEmptyRender()).to.equal(false);
  });

  it('should not display a single pattern as a div inside a select element', () => {
    const props = {
      activeTab: 'pysakit',
      gtfsId: 'LINKKI:9422',
      onSelectChange: () => {},
      params: {
        patternId: 'LINKKI:9422:1:01',
      },
      relay: {
        setVariables: () => {},
      },
      route: {
        id: 'Um91dGU6TElOS0tJOjk0MjI=',
        gtfsId: 'LINKKI:9422',
        color: '00662B',
        shortName: '42',
        longName: 'JYVÄSKYLÄ-LIEVESTUORE',
        mode: 'BUS',
        type: 3,
        agency: {
          phone: null,
          id: 'QWdlbmN5OjY3MTQ=',
          name: 'Jyväskylän Liikenne Oy',
          url: 'http://www.jyvaskylanliikenne.fi',
          fareUrl: null,
        },
        patterns: [
          {
            headsign: 'LIEVESTUORE',
            code: 'LINKKI:9422:1:01',
            stops: [
              {
                name: 'Keskussairaala 1',
              },
              {
                name: 'Liepeentie E',
              },
            ],
            tripsForDate: [{}],
          },
        ],
      },
      serviceDay: '20190626',
    };

    const wrapper = shallowWithIntl(<RoutePatternSelect {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('select > div')).to.have.lengthOf(0);
  });
});
