import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import Timetable from '../../../app/component/stop/Timetable';
import { renderWithProviders } from '../helpers/mock-providers';
import * as timetables from '../../../app/configurations/timetableConfigUtils';

const stopIdNumber = '1140199';

const props = {
  startDate: '20190110',
  onDateChange: () => {},
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
            stop: {
              gtfsId: `HSL:${stopIdNumber}`,
            },
          },
        ],
      },
    ],
  },
  date: '20190110',
  language: 'en',
};

describe('<Timetable />', () => {
  it('should set isCanceled to true for rows that have RealtimeState CANCELED', () => {
    const { container } = renderWithProviders(<Timetable {...props} />, {
      config: { CONFIG: 'default', URL: {} },
    });
    expect(
      container.querySelectorAll('.timetablerow-linetime'),
    ).to.have.lengthOf(1);
    expect(
      container.querySelectorAll('.timetablerow-linetime.canceled'),
    ).to.have.lengthOf(1);
  });

  it('should set valid stopPDFURL for StopPageActionBar', () => {
    const baseTimetableURL = 'https://timetabletest.com/stops/';
    const { container } = renderWithProviders(<Timetable {...props} />, {
      config: {
        CONFIG: 'default',
        URL: { STOP_TIMETABLES: { HSL: baseTimetableURL } },
        timetables: { HSL: timetables.default.HSL },
      },
    });
    expect(container.querySelectorAll('.secondary-button')).to.have.lengthOf(2);
  });
});
