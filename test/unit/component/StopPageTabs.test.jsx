import { screen } from '@testing-library/react';
import { expectNoA11yViolations } from '@digitransit-ui/test-utils';
import { renderWithProviders } from '../helpers/mock-providers';
import { mockMatch } from '../helpers/mock-router';
import StopPageTabs from '../../../app/component/stop/StopPageTabs';

const alert = (id, severity) => ({
  id,
  alertHash: id,
  alertSeverityLevel: severity,
  effectiveStartDate: 0,
  effectiveEndDate: 4102444800,
});

const stopMatch = { ...mockMatch, params: { stopId: 'HSL:1' } };
const terminalMatch = { ...mockMatch, params: { terminalId: 'HSL:2' } };

const renderTabs = (stop, match) =>
  renderWithProviders(
    <StopPageTabs stop={stop}>
      <div>content</div>
    </StopPageTabs>,
    { match },
  );

describe('<StopPageTabs />', () => {
  it('should render only children if stop information is missing', () => {
    const { container } = renderTabs(null, stopMatch);
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.getByText('content')).toBeTruthy();
    expect(container.querySelector('.stop-page-content-wrapper')).toBeTruthy();
  });

  it('counts the stop alerts for a stop', () => {
    const { container } = renderTabs(
      {
        gtfsId: 'HSL:1',
        alerts: [alert('a1', 'SEVERE')],
        canceledCalls: [],
      },
      stopMatch,
    );
    expect(container.querySelector('.alert-circle').textContent).toBe('1');
    expect(container.querySelector('.active-disruption-alert')).toBeTruthy();
  });

  it('counts the alerts of child stops for a terminal', () => {
    const { container } = renderTabs(
      {
        gtfsId: 'HSL:2',
        stops: [
          { gtfsId: 'HSL:21', alerts: [alert('a1', 'WARNING')] },
          { gtfsId: 'HSL:22', alerts: [alert('a2', 'INFO')] },
        ],
        canceledCalls: [],
      },
      terminalMatch,
    );
    expect(container.querySelector('.alert-circle').textContent).toBe('2');
    expect(container.querySelector('.active-disruption-alert')).toBeTruthy();
  });

  it('has no accessibility violations', async () => {
    renderTabs(
      { gtfsId: 'HSL:1', alerts: [alert('a1', 'SEVERE')], canceledCalls: [] },
      stopMatch,
    );
    await expectNoA11yViolations();
  });
});
