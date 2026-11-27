import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateTime, Settings } from 'luxon';
import Datetimepicker from './src/index';
import MobileTimepicker from './src/helpers/MobileTimepicker';
import {
  parseTypedTime,
  validateInput,
  getTs,
  getDateDisplay,
  getTimeDisplay,
  getPickerChoices,
} from './src/helpers/utils';

// A fixed timestamp (2023-11-15T00:13:20+02:00, Europe/Helsinki - the
// component's default timeZone) so the rendered date/time text is
// deterministic regardless of the host machine's own timezone or the wall
// clock at test time.
const FIXED_TIMESTAMP = 1700000000;

function renderPicker(props) {
  const calls = {
    onDepartureClick: [],
    onArrivalClick: [],
    onTimeChange: [],
    onDateChange: [],
    onNowClick: [],
  };
  const result = render(
    <Datetimepicker
      onDepartureClick={t => calls.onDepartureClick.push(t)}
      onArrivalClick={t => calls.onArrivalClick.push(t)}
      onTimeChange={(...args) => calls.onTimeChange.push(args)}
      onDateChange={(...args) => calls.onDateChange.push(args)}
      onNowClick={t => calls.onNowClick.push(t)}
      lang="en"
      initialTimestamp={FIXED_TIMESTAMP}
      {...props}
    />,
  );
  // The toggle button's accessible name is the visible summary followed by
  // the action, e.g. "Departure Wed 15.11. 00:13. Open the picker".
  const openButton = () => screen.getByRole('button', { name: /Open the picker$/ });
  return { ...result, calls, openButton };
}

describe('Testing @digitransit-component/digitransit-component-datetimepicker module', () => {
  it('shows the initial departure date and time on the closed toggle button', () => {
    const { openButton } = renderPicker();
    expect(openButton().textContent).toContain('Departure Wed 15.11. 00:13');
  });

  it('includes the visible text in the accessible name of the closed toggle button', () => {
    const { openButton } = renderPicker();
    expect(openButton().getAttribute('aria-label')).toBe(
      'Departure Wed 15.11. 00:13. Open the picker',
    );
    expect(openButton().getAttribute('aria-expanded')).toBe('false');
  });

  it('shows the initial arrival date and time when starting in arrival mode', () => {
    const { openButton } = renderPicker({ initialArriveBy: true });
    expect(openButton().textContent).toContain('Arrival Wed 15.11. 00:13');
  });

  it('switches to arrival mode and reports the click when the Arrival option is chosen', () => {
    const { calls, openButton } = renderPicker();
    fireEvent.click(openButton());
    fireEvent.click(screen.getByLabelText('Arrival'));
    expect(calls.onArrivalClick).toHaveLength(1);
    expect(calls.onArrivalClick[0]).toBe(FIXED_TIMESTAMP);
  });

  it('reports a "now" click as a departure at the current time', () => {
    const { calls, openButton } = renderPicker();
    fireEvent.click(openButton());
    fireEvent.click(screen.getByRole('button', { name: 'Leaving now' }));
    expect(calls.onNowClick).toHaveLength(1);
    expect(calls.onNowClick[0]).toBeTypeOf('number');
  });

  it('moves focus to the close button on open and back to the open button on close', () => {
    const { openButton } = renderPicker();
    fireEvent.click(openButton());
    const closeButton = screen.getByRole('button', { name: 'Close the picker' });
    expect(document.activeElement).toBe(closeButton);
    fireEvent.click(closeButton);
    expect(document.activeElement).toBe(openButton());
  });

  it('puts the close button before the other open picker controls in DOM order', () => {
    const { container, openButton } = renderPicker();
    fireEvent.click(openButton());
    const closeButton = screen.getByRole('button', { name: 'Close the picker' });
    const controls = Array.from(
      container.querySelectorAll('.datetimepicker-top-row')[1].querySelectorAll('button, input'),
    );
    expect(controls[0]).toBe(closeButton);
  });

  it('describes exactly what "Leaving now" does', () => {
    const { openButton } = renderPicker();
    fireEvent.click(openButton());
    const nowButton = screen.getByRole('button', { name: 'Leaving now' });
    const description = document.getElementById(nowButton.getAttribute('aria-describedby'));
    expect(description.textContent).toBe('Sets the departure time to now and closes the picker.');
  });

  it('adds the "new search" instruction only when showUpdateInstructions is set', () => {
    const text = 'Changing time parameters will trigger a new search.';
    const { unmount } = renderPicker();
    expect(screen.queryByText(text)).toBeNull();
    unmount();
    renderPicker({ showUpdateInstructions: true });
    expect(screen.getByText(text)).toBeTruthy();
  });

  it('hides decorative icons from assistive technology', () => {
    const { container } = renderPicker();
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach(svg => {
      expect(svg.closest('[aria-hidden="true"]')).not.toBeNull();
    });
  });

  it('returns focus to the open button after "Leaving now"', () => {
    const { openButton } = renderPicker();
    fireEvent.click(openButton());
    fireEvent.click(screen.getByRole('button', { name: 'Leaving now' }));
    expect(document.activeElement).toBe(openButton());
  });

  it('keeps the departure/arrival choice of each picker separate when several pickers are on a page', () => {
    const { container } = render(
      <>
        <Datetimepicker
          onDepartureClick={() => {}}
          onArrivalClick={() => {}}
          onTimeChange={() => {}}
          onDateChange={() => {}}
          onNowClick={() => {}}
          lang="en"
          initialTimestamp={FIXED_TIMESTAMP}
        />
        <Datetimepicker
          onDepartureClick={() => {}}
          onArrivalClick={() => {}}
          onTimeChange={() => {}}
          onDateChange={() => {}}
          onNowClick={() => {}}
          lang="en"
          initialTimestamp={FIXED_TIMESTAMP}
          initialArriveBy
        />
      </>,
    );
    const radios = [...container.querySelectorAll('input[type="radio"]')];
    expect(radios).toHaveLength(4);
    expect(radios.map(r => r.checked)).toEqual([true, false, false, true]);
    expect(new Set(radios.map(r => r.name)).size).toBe(2);
  });

  it('lists every quarter hour of a 25-hour day when DST ends', () => {
    // 2023-10-29T00:00:00+03:00: clocks in Europe/Helsinki go back from 04:00 to 03:00.
    const { container, openButton } = renderPicker({ initialTimestamp: 1698526800 });
    fireEvent.click(openButton());
    const timeInput = container.querySelector('input[id$="-time-input"]');
    fireEvent.keyDown(timeInput, { key: 'ArrowDown' });
    const labels = screen.getAllByRole('option').map(o => o.textContent);
    expect(labels).toHaveLength(100);
    expect(labels[0]).toBe('00:00');
    expect(labels.at(-1)).toBe('23:45');
    expect(labels.filter(l => l === '03:00')).toHaveLength(2);
  });
});

describe('datetimepicker utils', () => {
  const HOUR = 60 * 60 * 1000;
  const NOW = Date.UTC(2023, 10, 15, 8, 0, 0);
  const noon = DateTime.fromObject(
    { year: 2023, month: 11, day: 15, hour: 12 },
    { zone: 'Europe/Helsinki' },
  );
  const translate = key => ({ today: 'today', tomorrow: 'tomorrow' })[key];

  beforeEach(() => {
    Settings.defaultZone = 'Europe/Helsinki';
    Settings.defaultLocale = 'en';
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    Settings.defaultZone = 'system';
    Settings.defaultLocale = null;
  });

  describe('parseTypedTime', () => {
    it.each([
      ['123', '12:3'],
      ['000', '00:0'],
      ['235', '23:5'],
      // hour part would exceed 23, so only the first digit is the hour
      ['245', '2:45'],
      ['960', '9:60'],
    ])('adds the colon to three typed digits: %s -> %s', (typed, expected) => {
      expect(parseTypedTime(typed)).toBe(expected);
    });

    it.each([
      ['1234', '12:34'],
      ['0013', '00:13'],
      ['2460', '24:60'],
    ])('adds the colon to four typed digits: %s -> %s', (typed, expected) => {
      expect(parseTypedTime(typed)).toBe(expected);
    });

    it.each(['', '1', '12', '12:3', '12:30', '12345', 'abc', '1a3', '12a4'])(
      'leaves %j unchanged',
      typed => {
        expect(parseTypedTime(typed)).toBe(typed);
      },
    );
  });

  describe('validateInput', () => {
    it.each(['', '1', '9', '12', '99', '12:30', '0:00', '9:59', '23:59', '12:3', '2:5', '0:5'])(
      'accepts %j',
      value => {
        expect(validateInput(value)).toBe(true);
      },
    );

    it.each([
      ['24:00', 'hour over 23'],
      ['25:', 'hour over 23 with trailing colon'],
      ['12:60', 'minutes over 59'],
      ['12:75', 'minutes over 59'],
      ['1:2:3', 'seconds are not accepted'],
      ['0:6', 'minute tens digit over 5'],
      ['1:7', 'minute tens digit over 5'],
      ['066', 'minute tens digit over 5'],
      ['260', 'minutes over 59'],
      ['960', 'minutes over 59'],
    ])('rejects %j (%s)', value => {
      expect(validateInput(value)).toBe(false);
    });

    it.each(['060', '065', '165', '235', '245', '246'])(
      'accepts the three digit input %j',
      value => {
        expect(validateInput(value)).toBe(true);
      },
    );

    it.each(['1234', '0013', '2359'])('treats the digits %j as a time without a colon', value => {
      expect(validateInput(value)).toBe(true);
    });

    it.each(['2460', '1260', '12345', 'abcd', '12a4'])('rejects %j', value => {
      expect(validateInput(value)).toBe(false);
    });

    it('never throws and always returns a boolean', () => {
      const chars = '0123456789:.a';
      let inputs = [''];
      for (let length = 1; length <= 5; length += 1) {
        inputs = inputs.flatMap(input => [...chars].map(char => input + char));
        inputs.forEach(input => expect(validateInput(input)).toBeTypeOf('boolean'));
      }
    });
  });

  describe('getTs', () => {
    const base = noon.toMillis();

    it.each([
      ['12:30', '12:30'],
      ['12.30', '12:30'],
      ['9:05', '09:05'],
      [' 23:59 ', '23:59'],
      ['0:00', '00:00'],
    ])('parses %j on the same day as the current timestamp', (typed, expected) => {
      const ts = getTs(typed, base + 17 * 1000);
      expect(getTimeDisplay(ts)).toBe(expected);
      expect(DateTime.fromMillis(ts).toISODate()).toBe('2023-11-15');
      expect(DateTime.fromMillis(ts).second).toBe(0);
      expect(DateTime.fromMillis(ts).millisecond).toBe(0);
    });

    it.each(['', '12', '1230', '12:3', '24:00', '12:60', '12:30:15', 'ab:cd'])(
      'returns null for %j',
      typed => {
        expect(getTs(typed, base)).toBeNull();
      },
    );
  });

  describe('getDateDisplay', () => {
    it('shows today and tomorrow as capitalised translations', () => {
      expect(getDateDisplay(NOW, translate)).toBe('Today');
      expect(getDateDisplay(NOW + 24 * HOUR, translate)).toBe('Tomorrow');
    });

    it('shows other days as weekday, day and month in the selected locale', () => {
      expect(getDateDisplay(NOW + 2 * 24 * HOUR, translate)).toBe('Fri 17.11.');
      Settings.defaultLocale = 'fi';
      expect(getDateDisplay(NOW + 2 * 24 * HOUR, translate)).toBe('pe 17.11.');
      Settings.defaultLocale = 'sv';
      expect(getDateDisplay(NOW + 2 * 24 * HOUR, translate)).toBe('fre 17.11.');
    });

    it('decides today and tomorrow in the configured time zone', () => {
      // 01:30 on the 16th in Helsinki, 23:30 on the 15th in UTC
      const lateEvening = Date.UTC(2023, 10, 15, 23, 30, 0);
      expect(getDateDisplay(lateEvening, translate)).toBe('Tomorrow');
      Settings.defaultZone = 'UTC';
      expect(getDateDisplay(lateEvening, translate)).toBe('Today');
    });
  });

  describe('getTimeDisplay', () => {
    it('formats the time in the configured time zone', () => {
      expect(getTimeDisplay(1700000000000)).toBe('00:13');
      Settings.defaultZone = 'UTC';
      expect(getTimeDisplay(1700000000000)).toBe('22:13');
    });
  });

  describe('getPickerChoices', () => {
    const choicesFor = (timestamp, overrides = {}) =>
      getPickerChoices({
        timestamp,
        displayTimestamp: timestamp ?? NOW,
        serviceTimeRange: 30,
        stepMinutes: 15,
        ...overrides,
      });
    const labels = times => times.map(getTimeDisplay);

    it('lists every step of the selected day', () => {
      const [timeChoices] = choicesFor(noon.toMillis());
      expect(timeChoices).toHaveLength(96);
      expect(labels(timeChoices).slice(0, 2)).toEqual(['00:00', '00:15']);
      expect(getTimeDisplay(timeChoices.at(-1))).toBe('23:45');
      expect(DateTime.fromMillis(timeChoices[0]).toISODate()).toBe('2023-11-15');
    });

    it('uses the given step', () => {
      expect(choicesFor(noon.toMillis(), { stepMinutes: 1 })[0]).toHaveLength(1440);
    });

    it.each([
      ['25 hours when DST ends', '2023-10-29', 100],
      ['23 hours when DST starts', '2023-03-26', 92],
    ])('has the right number of quarter hours on a day of %s', (_, isoDate, expected) => {
      const day = DateTime.fromISO(isoDate, { zone: 'Europe/Helsinki' }).plus({ hours: 12 });
      expect(choicesFor(day.toMillis())[0]).toHaveLength(expected);
    });

    it('adds five minute steps for the next 30 minutes when "now" is selected', () => {
      const now = DateTime.fromMillis(NOW).set({ minute: 3, second: 30 }).toMillis();
      const [timeChoices] = choicesFor(null, { displayTimestamp: now });
      expect(timeChoices).toHaveLength(96 + 5);
      expect(timeChoices).toEqual([...timeChoices].sort((a, b) => a - b));
      expect(new Set(timeChoices).size).toBe(timeChoices.length);
      expect(labels(timeChoices).slice(40, 52)).toEqual([
        '10:00',
        '10:05',
        '10:10',
        '10:15',
        '10:20',
        '10:25',
        '10:30',
        '10:35',
        '10:45',
        '11:00',
        '11:15',
        '11:30',
      ]);
    });

    // Known bug: when "now" is after the last step of the day, the extra steps are spliced in
    // before the last choice and run past midnight. Change to `it` when fixed.
    it.fails('keeps the choices sorted when "now" is after the last step of the day', () => {
      const lateNow = DateTime.fromMillis(NOW).set({ hour: 23, minute: 59, second: 30 }).toMillis();
      const [timeChoices] = choicesFor(null, { displayTimestamp: lateNow, stepMinutes: 1 });
      expect(timeChoices).toEqual([...timeChoices].sort((a, b) => a - b));
    });

    it('lists serviceTimeRange dates starting today, at the selected time of day', () => {
      const [, dateChoices] = choicesFor(noon.plus({ days: 3, minutes: 5 }).toMillis(), {
        serviceTimeRange: 5,
      });
      expect(dateChoices).toHaveLength(5);
      expect(DateTime.fromMillis(dateChoices[0]).toISODate()).toBe('2023-11-15');
      expect(DateTime.fromMillis(dateChoices[4]).toISODate()).toBe('2023-11-19');
      dateChoices.forEach(date => expect(getTimeDisplay(date)).toBe('12:05'));
    });
  });
});

describe('typing a time without the colon', () => {
  const FIXED_TIME = 1700000000000;

  beforeEach(() => {
    Settings.defaultZone = 'Europe/Helsinki';
  });

  afterEach(() => {
    Settings.defaultZone = 'system';
  });

  it('keeps the colon in the mobile field when it is deleted or digits are pasted', () => {
    const changes = [];
    function Field() {
      const [value, setValue] = useState(FIXED_TIME);
      return (
        <MobileTimepicker
          value={value}
          onChange={ts => {
            changes.push(getTimeDisplay(ts));
            setValue(ts);
          }}
          id="time"
          label="Time"
        />
      );
    }
    const { container } = render(<Field />);
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: '12:11' } });
    fireEvent.change(input, { target: { value: '1211' } });
    expect(input.value).toBe('12:11');
    expect(container.querySelector('.mobile-datetimepicker-invalid-input')).toBeNull();
    expect(changes.at(-1)).toBe('12:11');
  });

  it('formats pasted digits as a time in the desktop time field', () => {
    const { container, openButton } = renderPicker();
    fireEvent.click(openButton());
    const timeInput = container.querySelector('input[id$="-time-input"]');
    fireEvent.change(timeInput, { target: { value: '1211' } });
    expect(timeInput.value).toBe('12:11');
    expect(container.querySelector('.datetimepicker-invalid-input')).toBeNull();
  });
});

describe('desktop time field input filtering', () => {
  const openTimeInput = () => {
    const { container, openButton } = renderPicker();
    fireEvent.click(openButton());
    return { container, timeInput: container.querySelector('input[id$="-time-input"]') };
  };

  // The selected text is replaced when typing over it, which makes the new text shorter
  it.each(['a', 'ab', '§', '!', '1.30', '1 30', '00:13a', '00:134'])(
    'ignores the edit that would give %j',
    text => {
      const { timeInput } = openTimeInput();
      fireEvent.change(timeInput, { target: { value: text } });
      expect(timeInput.value).toBe('00:13');
    },
  );

  it('accepts digits and the colon', () => {
    const { timeInput } = openTimeInput();
    fireEvent.change(timeInput, { target: { value: '1' } });
    expect(timeInput.value).toBe('1');
    fireEvent.change(timeInput, { target: { value: '12:' } });
    expect(timeInput.value).toBe('12:');
  });

  it('marks an impossible time as invalid', () => {
    const { container, timeInput } = openTimeInput();
    fireEvent.change(timeInput, { target: { value: '25:' } });
    expect(container.querySelector('.datetimepicker-invalid-input')).not.toBeNull();
    fireEvent.change(timeInput, { target: { value: '12:' } });
    expect(container.querySelector('.datetimepicker-invalid-input')).toBeNull();
  });
});
