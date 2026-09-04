import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DatetimepickerModule from './lib/index.cjs';

// Node's CJS/ESM interop binds a default import to the whole UMD `exports`
// object, not `.default` - cjs-module-lexer can't see named exports through
// Rollup's UMD factory indirection to unwrap it automatically.
const Datetimepicker = DatetimepickerModule.default;

// test.js runs as plain native ESM (no Babel at test time), so JSX isn't
// available here: use React.createElement directly instead.
const h = React.createElement;

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
    h(Datetimepicker, {
      onDepartureClick: t => calls.onDepartureClick.push(t),
      onArrivalClick: t => calls.onArrivalClick.push(t),
      onTimeChange: (...args) => calls.onTimeChange.push(args),
      onDateChange: (...args) => calls.onDateChange.push(args),
      onNowClick: t => calls.onNowClick.push(t),
      lang: 'en',
      initialTimestamp: FIXED_TIMESTAMP,
      ...props,
    }),
  );
  // The toggle button's accessible name comes from its associated <label>
  // (an sr-only "Open the picker" span), not from the visible date/time text
  // that's rendered as a child of the button itself - so locate it by its
  // accessible name and read the visible text separately.
  const openButton = () =>
    screen.getByRole('button', { name: 'Open the picker' });
  return { ...result, calls, openButton };
}

describe('Testing @digitransit-component/digitransit-component-datetimepicker module', () => {
  it('shows the initial departure date and time on the closed toggle button', () => {
    const { openButton } = renderPicker();
    expect(openButton().textContent).to.include('Departure Wed 15.11. 00:13');
  });

  it('shows the initial arrival date and time when starting in arrival mode', () => {
    const { openButton } = renderPicker({ initialArriveBy: true });
    expect(openButton().textContent).to.include('Arrival Wed 15.11. 00:13');
  });

  it('switches to arrival mode and reports the click when the Arrival option is chosen', () => {
    const { calls, openButton } = renderPicker();
    fireEvent.click(openButton());
    fireEvent.click(screen.getByLabelText('Arrival'));
    expect(calls.onArrivalClick).to.have.lengthOf(1);
    expect(calls.onArrivalClick[0]).to.equal(FIXED_TIMESTAMP);
  });

  it('reports a "now" click as a departure at the current time', () => {
    const { calls, openButton } = renderPicker();
    fireEvent.click(openButton());
    fireEvent.click(screen.getByRole('button', { name: 'Leaving now' }));
    expect(calls.onNowClick).to.have.lengthOf(1);
    expect(calls.onNowClick[0]).to.be.a('number');
  });
});
