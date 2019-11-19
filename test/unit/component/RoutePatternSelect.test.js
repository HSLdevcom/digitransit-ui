import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import moment from 'moment'; // DT-3182
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
            tripsForDate: [
              {
                stoptimes: [
                  {
                    scheduledArrival: 120,
                    scheduledDeparture: 120,
                    erviceDay: 1551996000,
                    stop: {
                      id: 'U3RvcDpIU0w6MTI5MTQwNA==',
                    },
                  },
                  {
                    scheduledArrival: 240,
                    scheduledDeparture: 240,
                    erviceDay: 1551996000,
                    stop: {
                      id: 'U3RvcDpIU0w6MTI5MTQwMg==',
                    },
                  },
                ],
              },
            ],
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

  it('should create a select element for 4 patterns ', () => {
    // DT-3182
    const currentDay = new Date();
    const currentTimeInSecs = currentDay.getTime() / 1000;

    currentDay.setHours(0);
    currentDay.setMinutes(0);
    currentDay.setSeconds(0);
    currentDay.setMilliseconds(0);

    const serviceDayInSecs = currentDay.getTime() / 1000;
    const serviceDay = moment().format('YYYYMMDD');

    const futureTrip11 = currentTimeInSecs - serviceDayInSecs + 3600;
    const futureTrip12 = currentTimeInSecs - serviceDayInSecs + 3720;
    const futureTrip21 = currentTimeInSecs - serviceDayInSecs + 7200;
    const futureTrip22 = currentTimeInSecs - serviceDayInSecs + 7320;
    const futureTrip31 = currentTimeInSecs - serviceDayInSecs + 14400;
    const futureTrip32 = currentTimeInSecs - serviceDayInSecs + 14520;

    const props = {
      useCurrentTime: true,
      onSelectChange: () => {},
      gtfsId: 'HSL:1010',
      activeTab: 'pysakit',
      className: 'bp-large',
      serviceDay,
      relay: {
        setVariables: () => {},
      },
      params: {
        routeId: 'HSL:1010',
        patternId: 'HSL:1010:0:01',
      },
      route: {
        patterns: [
          {
            code: 'HSL:1010:1:02',
            headsign: 'Kirurgi',
            stops: [
              {
                name: 'Korppaanmäki',
              },
              {
                name: 'Johanneksenkirkko',
              },
              {
                name: 'Tarkk´ampujankatu',
              },
            ],
            tripsForDate: [
              {
                stoptimes: [
                  {
                    scheduledArrival: 120,
                    scheduledDeparture: 120,
                    serviceDay: serviceDayInSecs,
                    stop: {
                      id: 'U3RvcDpIU0w6MTI5MTQwNA==',
                    },
                  },
                  {
                    scheduledArrival: 240,
                    scheduledDeparture: 240,
                    serviceDay: serviceDayInSecs,
                    stop: {
                      id: 'U3RvcDpIU0w6MTI5MTQwMg==',
                    },
                  },
                ],
              },
            ],
          },
          {
            code: 'HSL:1010:0:01',
            headsign: 'Pikku Huopalahti',
            stops: [
              {
                name: 'Korppaanmäki',
              },
              {
                name: 'Johanneksenkirkko',
              },
              {
                name: 'Tarkk´ampujankatu',
              },
            ],
            tripsForDate: [
              {
                stoptimes: [
                  {
                    scheduledArrival: futureTrip11,
                    scheduledDeparture: futureTrip11,
                    serviceDay: serviceDayInSecs,
                    stop: {
                      id: 'U3RvcDpIU0w6MTI5MTQwNA==',
                    },
                  },
                  {
                    scheduledArrival: futureTrip12,
                    scheduledDeparture: futureTrip12,
                    serviceDay: serviceDayInSecs,
                    stop: {
                      id: 'U3RvcDpIU0w6MTI5MTQwMg==',
                    },
                  },
                ],
              },
            ],
          },
          {
            code: 'HSL:1010:1:03',
            headsign: 'Ylioppilastalo',
            stops: [
              {
                name: 'Ooppera',
              },
              {
                name: 'Lasipalatsi',
              },
              {
                name: 'Ylioppilastalo',
              },
            ],
            tripsForDate: [
              {
                stoptimes: [
                  {
                    scheduledArrival: futureTrip21,
                    scheduledDeparture: futureTrip21,
                    serviceDay: serviceDayInSecs,
                    stop: {
                      id: 'U3RvcDpIU0w6MTI5MTQwNA==',
                    },
                  },
                  {
                    scheduledArrival: futureTrip22,
                    scheduledDeparture: futureTrip22,
                    serviceDay: serviceDayInSecs,
                    stop: {
                      id: 'U3RvcDpIU0w6MTI5MTQwMg==',
                    },
                  },
                ],
              },
            ],
          },
          {
            code: 'HSL:1010:0:04',
            headsign: 'Ooppera',
            stops: [
              {
                name: 'Ylioppilastalo',
              },
              {
                name: 'Lasipalatsi',
              },
              {
                name: 'Ooppera',
              },
            ],
            tripsForDate: [
              {
                stoptimes: [
                  {
                    scheduledArrival: futureTrip31,
                    scheduledDeparture: futureTrip31,
                    serviceDay: serviceDayInSecs,
                    stop: {
                      id: 'U3RvcDpIU0w6MTI5MTQwNA==',
                    },
                  },
                  {
                    scheduledArrival: futureTrip32,
                    scheduledDeparture: futureTrip32,
                    serviceDay: serviceDayInSecs,
                    stop: {
                      id: 'U3RvcDpIU0w6MTI5MTQwMg==',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    const wrapper = shallowWithIntl(<RoutePatternSelect {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('option')).to.have.lengthOf(4);
  });
});
