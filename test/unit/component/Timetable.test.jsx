import Timetable from '../../../app/component/stop/Timetable';
import { renderWithProviders } from '../helpers/mock-providers';
import * as timetables from '../../../utils/server/timetableConfigUtils';

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
          stops: [{ gtfsId: `HSL:${stopIdNumber}` }, { gtfsId: 'HSL:last' }],
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
    expect(container.querySelectorAll('.timetablerow-linetime')).toHaveLength(
      1,
    );
    expect(
      container.querySelectorAll('.timetablerow-linetime.canceled'),
    ).toHaveLength(1);
  });

  it('uses stoptime headsigns and hides drop-off-only and last-stop times', () => {
    const makeStoptime = (
      headsign,
      scheduledDeparture,
      pickupType,
      position = 0,
    ) => ({
      headsign,
      pickupType,
      stopPositionInPattern: position,
      realtimeState: 'SCHEDULED',
      scheduledDeparture,
      serviceDay: 1547071200,
      stop: { gtfsId: `HSL:${stopIdNumber}` },
    });
    const [base] = props.stop.stoptimesForServiceDate;
    const stop = {
      ...props.stop,
      stoptimesForServiceDate: [
        {
          ...base,
          stoptimes: [
            makeStoptime('Tuorsniemi', 32460, 'SCHEDULED'),
            makeStoptime('Leppäkorpi', 36060, 'SCHEDULED'),
            makeStoptime('Leppäkorpi', 39660, 'NONE'),
            makeStoptime('Kamppi', 43260, 'SCHEDULED', 1),
          ],
        },
      ],
    };
    const { container } = renderWithProviders(
      <Timetable {...props} stop={stop} />,
      { config: { CONFIG: 'default', URL: {} } },
    );
    expect(container.querySelectorAll('.timetablerow-linetime')).toHaveLength(
      2,
    );
    const text = container.textContent;
    expect(text).toContain('70* = Tuorsniemi');
    expect(text).toContain('70** = Leppäkorpi');
    expect(text).not.toContain('Kamppi');
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
    expect(container.querySelectorAll('.secondary-button')).toHaveLength(2);
  });
});
