import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import Timetable from '../../../app/component/Timetable';
import TimetableRow from '../../../app/component/TimetableRow';
import StopPageActionBar from '../../../app/component/StopPageActionBar';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';

const config = require('../../../app/configurations/config.hsl').default;

const props = {
  propsForStopPageActionBar: {
    startDate: '20190110',
    selectedDate: '20190110',
    onDateChange: () => {},
  },
  stop: {
    gtfsId: 'HSL:1140199',
    locationType: 'STOP',
    name: 'Ooppera',
    stoptimesForServiceDate: [
      {
        pattern: {
          code: 'HSL:1070:1:01',
          headsign: 'Kamppi',
          route: {
            agency: {
              name: 'Helsingin seudun liikenne',
            },
            longName: 'Kamppi-Töölö-Pihlajamäki-Pukinmäki-Malmi',
            mode: 'BUS',
            shortName: '70',
          },
        },
        stoptimes: [
          {
            headsign: 'Kamppi via Töölö',
            pickupType: 'SCHEDULED',
            realtimeState: 'CANCELED',
            scheduledDeparture: 32460,
            serviceDay: 1547071200,
          },
        ],
      },
    ],
  },
};

describe('<Timetable />', () => {
  it('should set isCanceled to true for rows that have RealtimeState CANCELED', () => {
    const wrapper = shallowWithIntl(<Timetable {...props} />, {
      context: {
        config: {
          URL: {},
        },
      },
    });
    expect(wrapper.find(TimetableRow)).to.have.lengthOf(1);
    expect(wrapper.find(TimetableRow).prop('stoptimes')[0].isCanceled).to.equal(
      true,
    );
  });

  it('should set valid stopPDFURL for StopPageActionBar', () => {
    const wrapper = shallowWithIntl(<Timetable {...props} />, {
      context: {
        config,
      },
    });
    expect(wrapper.find(StopPageActionBar)).to.have.lengthOf(1);
    expect(wrapper.find(StopPageActionBar).prop('stopPDFURL')).to.equal(
      'https://dev-api.digitransit.fi/timetables/v1/hsl/stops/1140199.pdf',
    );
  });
});
