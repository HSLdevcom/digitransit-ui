import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import sinon from 'sinon';

import moment from 'moment'; // DT-3182
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { mockContext } from '../helpers/mock-context';
import { Component as RoutePatternSelect } from '../../../app/component/RoutePatternSelect';
import dt2887 from '../test-data/dt2887';
import dt2887b from '../test-data/dt2887b';
import { PREFIX_STOPS } from '../../../app/util/path';
import * as analytics from '../../../app/util/analyticsUtils';

describe('<RoutePatternSelect />', () => {
  it('should render', () => {
    const wrapper = shallowWithIntl(<RoutePatternSelect {...dt2887} />, {
      context: {
        ...mockContext,
        config: { itinerary: { serviceTimeRange: 30 } },
      },
    });
    expect(wrapper.isEmptyRender()).to.equal(false);
  });
  it('should create a select element for more than 2 patterns', () => {
    const wrapper = shallowWithIntl(<RoutePatternSelect {...dt2887} />, {
      context: {
        ...mockContext,
        config: { itinerary: { serviceTimeRange: 30 } },
      },
    });
    expect(wrapper.find('#select-route-pattern')).to.have.lengthOf(1);
  });
  it('should create a toggle element if there are only 2 patterns', () => {
    const wrapper = shallowWithIntl(<RoutePatternSelect {...dt2887b} />, {
      context: {
        ...mockContext,
        config: { itinerary: { serviceTimeRange: 30 } },
      },
    });
    expect(wrapper.find('.route-patterns-toggle')).to.have.lengthOf(1);
  });
  it('should create as many options as there are patterns', () => {
    const wrapper = shallowWithIntl(<RoutePatternSelect {...dt2887} />, {
      context: {
        ...mockContext,
        config: { itinerary: { serviceTimeRange: 30 } },
      },
    });
    expect(wrapper.find('#select-route-pattern > option')).to.have.lengthOf(3);
  });

  it('should render a toggle element with divs if there are no patterns with trips', () => {
    const props = {
      lang: 'fi', // DT-3347
      activeTab: PREFIX_STOPS,
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
            activeDates: [], // DT-2531
          },
          {
            code: 'HSL:3002U:1:01',
            headsign: 'Helsinki',
            stops: [{ name: 'Kauklahti' }, { name: 'Helsinki' }],
            tripsForDate: [],
            activeDates: [], // DT-2531
          },
          {
            code: 'HSL:3002U:0:02',
            headsign: 'Kirkkonummi',
            stops: [{ name: 'Helsinki' }, { name: 'Kirkkonummi' }],
            tripsForDate: [],
            activeDates: [], // DT-2531
          },
          {
            code: 'HSL:3002U:0:03',
            stops: [{ name: 'Helsinki' }, { name: 'Siuntio' }],
            tripsForDate: [],
            activeDates: [], // DT-2531
          },
        ],
      },
      serviceDay: '20190604',
    };
    const wrapper = shallowWithIntl(<RoutePatternSelect {...props} />, {
      context: {
        ...mockContext,
        config: { itinerary: { serviceTimeRange: 30 } },
      },
    });
    expect(wrapper.find('option')).to.have.lengthOf(0); // DT-2531: shows main routes (both directions), so only togglable option is shown
    expect(wrapper.find('button.toggle-direction')).to.have.lengthOf(1); // DT-2531: shows main routes (both directions), only togglable option is shown
  });

  it('should redirect to the first existing pattern if there is no matching pattern available', () => {
    const currentDay = new Date();
    currentDay.setHours(0);
    currentDay.setMinutes(0);
    currentDay.setSeconds(0);
    currentDay.setMilliseconds(0);

    const serviceDayInSecs = currentDay.getTime() / 1000;

    const props = {
      lang: 'fi', // DT-3347
      activeTab: PREFIX_STOPS,
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
            tripsForDate: [],
            activeDates: [], // DT-2531
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
            activeDates: [], // DT-2531
          },
        ],
      },
      serviceDay: '20190604',
    };

    let url;
    shallowWithIntl(<RoutePatternSelect {...props} />, {
      context: {
        ...mockContext,
        config: { itinerary: { serviceTimeRange: 30 } },
        router: {
          ...mockContext.router,
          replace: args => {
            url = args;
          },
        },
      },
    });
    expect(url).to.contain(props.gtfsId);
    expect(url).to.contain(props.route.patterns[1].code); // DT-3182: sorting trips
  });

  it('should not crash if there are no patterns with trips available for the current date', () => {
    const props = {
      lang: 'fi', // DT-3347
      activeTab: PREFIX_STOPS,
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
            activeDates: [], // DT-2531
          },
          {
            code: 'HSL:3002U:1:01',
            headsign: 'Kirkkonummi',
            stops: [{ name: 'Helsinki' }, { name: 'Kirkkonummi' }],
            tripsForDate: [],
            activeDates: [], // DT-2531
          },
        ],
      },
      serviceDay: '20190604',
    };

    const wrapper = shallowWithIntl(<RoutePatternSelect {...props} />, {
      context: {
        ...mockContext,
        config: { itinerary: { serviceTimeRange: 30 } },
      },
    });
    expect(wrapper.isEmptyRender()).to.equal(false);
  });

  it('should not display a single pattern as a div inside a select element', () => {
    const props = {
      lang: 'fi', // DT-3347
      activeTab: PREFIX_STOPS,
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
            tripsForDate: [],
            activeDates: [], // DT-2531
          },
        ],
      },
      serviceDay: '20190626',
    };

    const wrapper = shallowWithIntl(<RoutePatternSelect {...props} />, {
      context: {
        ...mockContext,
        config: { itinerary: { serviceTimeRange: 30 } },
      },
    });
    expect(wrapper.find('select > div')).to.have.lengthOf(0);
  });

  it.skip('should call addAnalyticsEvent when select is opened', () => {
    const props = {
      lang: 'fi', // DT-3347
      serviceDay: 'test',
      onSelectChange: () => {},
      gtfsId: 'test',
      relay: { setVariables: () => {} },
      route: {
        patterns: [
          { code: 'test1', stops: [{ name: '1' }] },
          { code: 'test2', stops: [{ name: '2' }] },
          { code: 'test3', stops: [{ name: '3' }] },
        ],
      },
      params: {},
    };
    const spy = sinon.spy(analytics, 'addAnalyticsEvent');
    const wrapper = shallowWithIntl(<RoutePatternSelect {...props} />, {
      context: {
        ...mockContext,
        config: {
          map: { useModeIconsInNonTileLayer: true },
          itinerary: { serviceTimeRange: 30 },
        },
      },
    });
    wrapper.find('select').simulate('mouseDown');
    expect(spy.calledOnce).to.equal(true);
    spy.restore();
  });

  it('should create a select element for more than 2 patterns ', () => {
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
      lang: 'fi', // DT-3347
      useCurrentTime: true,
      onSelectChange: () => {},
      gtfsId: 'HSL:1010',
      activeTab: PREFIX_STOPS,
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
            activeDates: [], // DT-2531
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
            activeDates: [], // DT-2531
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
            activeDates: [], // DT-2531
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
            activeDates: [], // DT-2531
          },
        ],
      },
    };

    const wrapper = shallowWithIntl(<RoutePatternSelect {...props} />, {
      context: {
        ...mockContext,
        config: { itinerary: { serviceTimeRange: 30 } },
      },
    });
    expect(wrapper.find('option')).to.have.length.above(2);
  });
});
