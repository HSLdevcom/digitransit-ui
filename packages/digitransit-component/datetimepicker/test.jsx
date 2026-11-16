import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Datetimepicker from './src/index';

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
  const openButton = () =>
    screen.getByRole('button', { name: /Open the picker$/ });
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
    const closeButton = screen.getByRole('button', {
      name: 'Close the picker',
    });
    expect(document.activeElement).toBe(closeButton);
    fireEvent.click(closeButton);
    expect(document.activeElement).toBe(openButton());
  });

  it('puts the close button before the other open picker controls in DOM order', () => {
    const { container, openButton } = renderPicker();
    fireEvent.click(openButton());
    const closeButton = screen.getByRole('button', {
      name: 'Close the picker',
    });
    const controls = Array.from(
      container
        .querySelectorAll('.datetimepicker-top-row')[1]
        .querySelectorAll('button, input'),
    );
    expect(controls[0]).toBe(closeButton);
  });

  it('describes exactly what "Leaving now" does', () => {
    const { openButton } = renderPicker();
    fireEvent.click(openButton());
    const nowButton = screen.getByRole('button', { name: 'Leaving now' });
    const description = document.getElementById(
      nowButton.getAttribute('aria-describedby'),
    );
    expect(description.textContent).toBe(
      'Sets the departure time to now and closes the picker.',
    );
  });

  it('adds the "new search" instruction only when showUpdateInstructions is set', () => {
    const text = 'Changing time parameters will trigger a new search.';
    const { unmount } = renderPicker();
    expect(screen.queryByText(text)).toBeNull();
    unmount();
    renderPicker({ showUpdateInstructions: true });
    expect(screen.getByText(text)).toBeTruthy();
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
});
