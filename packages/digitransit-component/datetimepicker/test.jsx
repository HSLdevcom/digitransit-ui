import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { DateTime, Settings } from 'luxon';
import Datetimepicker from './src/index';
import DesktopDatetimepicker from './src/helpers/DesktopDatetimepicker';
import MobileTimepicker from './src/helpers/MobileTimepicker';
import i18n from './src/helpers/i18n';
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

describe('DesktopDatetimepicker', () => {
  // 2023-11-15 12:00 in Europe/Helsinki
  const NOON = DateTime.fromObject(
    { year: 2023, month: 11, day: 15, hour: 12 },
    { zone: 'Europe/Helsinki' },
  ).toMillis();
  const [MINUTE_CHOICES] = getPickerChoices({
    timestamp: NOON,
    displayTimestamp: NOON,
    serviceTimeRange: 30,
    stepMinutes: 1,
  });

  beforeEach(() => {
    Settings.defaultZone = 'Europe/Helsinki';
    Settings.defaultLocale = 'en';
  });

  afterEach(() => {
    Settings.defaultZone = 'system';
    Settings.defaultLocale = null;
  });

  const field = (props = {}) => (
    <I18nextProvider i18n={i18n}>
      <DesktopDatetimepicker
        value={NOON}
        timeChoices={MINUTE_CHOICES}
        id="time"
        label="Time"
        icon={<span />}
        lang="en"
        {...props}
      />
    </I18nextProvider>
  );

  const renderField = (props = {}) => {
    const onChange = vi.fn();
    const result = render(field({ onChange, ...props }));
    const input = result.container.querySelector('#time-input');
    return { ...result, onChange, input };
  };

  const openList = input => {
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    return screen.queryAllByRole('option').map(option => option.textContent);
  };

  const type = (input, text) => fireEvent.change(input, { target: { value: text } });

  describe('time field', () => {
    it('shows the selected time', () => {
      expect(renderField().input.value).toBe('12:00');
    });

    it('lists only quarter hours when the list is opened', () => {
      const { input } = renderField();
      const labels = openList(input);
      expect(labels).toHaveLength(96);
      expect(labels.slice(0, 3)).toEqual(['00:00', '00:15', '00:30']);
      expect(labels.every(label => Number(label.split(':')[1]) % 15 === 0)).toBe(true);
    });

    it('reports the chosen option', () => {
      const { input, onChange } = renderField();
      openList(input);
      fireEvent.click(screen.getByRole('option', { name: '13:15' }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(getTimeDisplay(onChange.mock.calls[0][0])).toBe('13:15');
      expect(DateTime.fromMillis(onChange.mock.calls[0][0]).toISODate()).toBe('2023-11-15');
    });

    it('selects the typed text on focus', () => {
      const { input } = renderField();
      const select = vi.spyOn(input, 'select');
      fireEvent.focus(input);
      expect(select).toHaveBeenCalled();
    });

    it('follows the value given by the parent', () => {
      const { input, rerender, onChange } = renderField();
      type(input, '25:');
      rerender(field({ onChange, value: NOON + 2 * 60 * 60 * 1000 }));
      expect(input.value).toBe('14:00');
      expect(document.querySelector('.datetimepicker-invalid-input')).toBeNull();
    });

    describe('typing', () => {
      it('commits a complete time when focus leaves the field', () => {
        const { input, onChange } = renderField();
        type(input, '1330');
        expect(input.value).toBe('13:30');
        fireEvent.blur(input);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(getTimeDisplay(onChange.mock.calls[0][0])).toBe('13:30');
      });

      it('commits a typed time with a single digit hour', () => {
        const { input, onChange } = renderField();
        type(input, '9:05');
        fireEvent.blur(input);
        expect(getTimeDisplay(onChange.mock.calls[0][0])).toBe('09:05');
      });

      it('commits the typed time with Enter', () => {
        const { input, onChange } = renderField();
        type(input, '13:37');
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(getTimeDisplay(onChange.mock.calls[0][0])).toBe('13:37');
      });

      it('restores the current time instead of committing an incomplete or impossible one', () => {
        const { input, onChange } = renderField();
        type(input, '25:');
        fireEvent.blur(input);
        expect(onChange).not.toHaveBeenCalled();
        expect(input.value).toBe('12:00');
        expect(document.querySelector('.datetimepicker-invalid-input')).toBeNull();

        type(input, '13:');
        fireEvent.blur(input);
        expect(onChange).not.toHaveBeenCalled();
        expect(input.value).toBe('12:00');
      });

      it('does nothing on blur when nothing was typed', () => {
        const { input, onChange } = renderField();
        fireEvent.focus(input);
        fireEvent.blur(input);
        expect(onChange).not.toHaveBeenCalled();
      });

      it('narrows the list to the typed hour', () => {
        const { input } = renderField();
        fireEvent.focus(input);
        type(input, '13');
        expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual([
          '13:00',
          '13:15',
          '13:30',
          '13:45',
        ]);
      });

      it('narrows the list to the matching minutes when the minute tens digit is typed', () => {
        const { input } = renderField();
        fireEvent.focus(input);
        type(input, '13:4');
        expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual([
          '13:40',
          '13:41',
          '13:42',
          '13:43',
          '13:44',
          '13:45',
          '13:46',
          '13:47',
          '13:48',
          '13:49',
        ]);
      });

      it('narrows the list to the typed complete time', () => {
        const { input } = renderField();
        fireEvent.focus(input);
        type(input, '13:37');
        expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['13:37']);
      });

      it('marks an impossible time as invalid and clears the mark when the value is fixed', () => {
        const { input } = renderField();
        type(input, '12:75');
        expect(document.querySelector('.datetimepicker-invalid-input')).not.toBeNull();
        type(input, '12:7');
        expect(document.querySelector('.datetimepicker-invalid-input')).not.toBeNull();
        type(input, '12:5');
        expect(document.querySelector('.datetimepicker-invalid-input')).toBeNull();
      });
    });
  });

  describe('date field', () => {
    // Dates are listed from today on, so the clock is fixed to 2023-11-15 10:00 in Helsinki
    let dateChoices;

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(Date.UTC(2023, 10, 15, 8, 0, 0));
      [, dateChoices] = getPickerChoices({
        timestamp: NOON,
        displayTimestamp: NOON,
        serviceTimeRange: 5,
        stepMinutes: 1,
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const renderDate = (value = NOON) =>
      renderField({
        id: 'date',
        label: 'Date',
        datePicker: true,
        disableTyping: true,
        timeChoices: dateChoices,
        value,
      });

    it('shows the selected date', () => {
      const { container } = renderDate(NOON + 2 * 24 * 60 * 60 * 1000);
      expect(container.querySelector('.datetimepicker-select__single-value').textContent).toBe(
        'Fri 17.11.',
      );
    });

    it('lists today, tomorrow and the following dates and reports the chosen one', () => {
      const { container, onChange } = renderDate();
      const input = container.querySelector('#date-input');
      expect(input.getAttribute('aria-readonly')).toBe('true');
      expect(openList(input)).toEqual([
        'Today',
        'Tomorrow',
        'Fri 17.11.',
        'Sat 18.11.',
        'Sun 19.11.',
      ]);
      fireEvent.click(screen.getByRole('option', { name: 'Fri 17.11.' }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toBe(dateChoices[2]);
    });
  });
});

describe('mobile picker modal', () => {
  const IPHONE =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const ANDROID =
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Mobile Safari/537.36';
  // 2023-11-15 12:00 in Europe/Helsinki
  const NOW = Date.UTC(2023, 10, 15, 10, 0, 0);

  beforeEach(() => {
    // Dates are listed from today on
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const renderMobilePicker = ({ userAgent = IPHONE, ...props } = {}) => {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(userAgent);
    const result = renderPicker(props);
    fireEvent.click(result.openButton());
    return result;
  };

  const modalIsOpen = () => screen.queryByRole('heading', { name: 'Choose time' }) !== null;
  const timeOf = seconds => DateTime.fromSeconds(seconds, { zone: 'Europe/Helsinki' });
  const ready = () => fireEvent.click(screen.getByRole('button', { name: 'Ready' }));

  it('opens a modal with the current date and time, and no desktop comboboxes', () => {
    const { container } = renderMobilePicker();
    expect(modalIsOpen()).toBe(true);
    expect(screen.getByRole('dialog', { name: 'Choose time' })).toBeTruthy();
    expect(screen.getByLabelText('Date').value).toBe(
      screen.getByRole('option', { name: 'Today' }).value,
    );
    expect(screen.getByLabelText('Time').value).toBe('00:13');
    expect(screen.getByLabelText('Departure').checked).toBe(true);
    expect(container.querySelector('input[id$="-time-input"]')).toBeNull();
  });

  it('lists serviceTimeRange dates starting today', () => {
    renderMobilePicker({ serviceTimeRange: 4 });
    const labels = screen.getAllByRole('option').map(option => option.textContent);
    expect(labels).toEqual(['Today', 'Tomorrow', 'Fri 17.11.', 'Sat 18.11.']);
  });

  it('submits the edited date, time and arrival mode with Ready', () => {
    const { calls } = renderMobilePicker();
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: screen.getByRole('option', { name: 'Fri 17.11.' }).value },
    });
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '14:45' } });
    fireEvent.click(screen.getByLabelText('Arrival'));
    // Nothing is reported before Ready
    expect(calls.onTimeChange).toHaveLength(0);
    ready();
    expect(calls.onTimeChange).toHaveLength(1);
    const [seconds, arriveBy, submitted] = calls.onTimeChange[0];
    expect(timeOf(seconds).toFormat('yyyy-MM-dd HH:mm')).toBe('2023-11-17 14:45');
    expect(arriveBy).toBe(true);
    expect(submitted).toBe(true);
    expect(modalIsOpen()).toBe(false);
  });

  it('keeps the date and time when only the departure/arrival mode is changed', () => {
    const { calls } = renderMobilePicker();
    fireEvent.click(screen.getByLabelText('Arrival'));
    ready();
    const [seconds, arriveBy] = calls.onTimeChange[0];
    expect(seconds).toBe(FIXED_TIMESTAMP);
    expect(arriveBy).toBe(true);
  });

  it('does not submit an incomplete time', () => {
    const { calls } = renderMobilePicker();
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '14:4' } });
    ready();
    expect(timeOf(calls.onTimeChange[0][0]).toFormat('HH:mm')).toBe('00:13');
  });

  it('closes without reporting anything on Cancel and returns focus to the open button', async () => {
    const onClose = vi.fn();
    const { calls, openButton } = renderMobilePicker({ onClose });
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '14:45' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(modalIsOpen()).toBe(false);
    expect(calls.onTimeChange).toHaveLength(0);
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(document.activeElement).toBe(openButton()));
  });

  it('closes and reports "now" with the Leaving now button', () => {
    const { calls } = renderMobilePicker();
    fireEvent.click(screen.getByRole('button', { name: 'Leaving now' }));
    expect(modalIsOpen()).toBe(false);
    expect(calls.onNowClick).toHaveLength(1);
    expect(calls.onTimeChange).toHaveLength(0);
  });

  it('opens the modal from the url state with openPicker', () => {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(IPHONE);
    renderPicker({ openPicker: true });
    expect(modalIsOpen()).toBe(true);
  });

  it('uses the desktop picker on a desktop browser', () => {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/118.0 Safari/537.36',
    );
    const { openButton } = renderPicker();
    fireEvent.click(openButton());
    expect(modalIsOpen()).toBe(false);
  });

  describe('on Android', () => {
    // Android gets a custom list instead of the native select
    it('chooses the date from a custom list', () => {
      const { calls } = renderMobilePicker({ userAgent: ANDROID });
      expect(document.querySelector('select')).toBeNull();
      const toggle = screen.getByRole('combobox', { name: 'Date' });
      expect(toggle.textContent).toBe('Today');
      fireEvent.click(toggle);
      expect(
        screen
          .getAllByRole('option')
          .slice(0, 3)
          .map(o => o.textContent),
      ).toEqual(['Today', 'Tomorrow', 'Fri 17.11.']);
      fireEvent.click(screen.getByRole('option', { name: 'Fri 17.11.' }));
      ready();
      expect(timeOf(calls.onTimeChange[0][0]).toFormat('yyyy-MM-dd HH:mm')).toBe(
        '2023-11-17 00:13',
      );
    });
  });
});
