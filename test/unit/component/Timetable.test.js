import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { mockContext } from '../helpers/mock-context';

import Timetable from '../../../app/component/Timetable';
import TimetableRow from '../../../app/component/TimetableRow';
import SecondaryButton from '../../../app/component/SecondaryButton';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import * as timetables from '../../../app/configurations/timetableConfigUtils';

const stopIdNumber = '1140199';

const props = {
  propsForDateSelect: {
    startDate: '20190110',
    selectedDate: '20190110',
    onDateChange: () => {},
  },
  stop: {
    gtfsId: `HSL:${stopIdNumber}`,
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
        ...mockContext,
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
    const baseTimetableURL = 'https://timetabletest.com/stops/';
    const wrapper = shallowWithIntl(<Timetable {...props} />, {
      context: {
        ...mockContext,
        config: {
          URL: { STOP_TIMETABLES: { HSL: baseTimetableURL } },
          timetables: { HSL: timetables.default.HSL },
        },
      },
    });
    expect(wrapper.find(SecondaryButton)).to.have.lengthOf(2);
  });
});
