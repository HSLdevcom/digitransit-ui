import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import StopScheduleStatus from '../../../app/component/stop/StopScheduleStatus';
import { STOP_STATUS } from '../../../utils/client/stopStatusUtils';

describe('<StopScheduleStatus />', () => {
  it('renders nothing when status is undefined', () => {
    const { container } = renderWithProviders(<StopScheduleStatus />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the status message when status is set and no alertEffects are present', () => {
    const { container } = renderWithProviders(
      <StopScheduleStatus status={STOP_STATUS.OUT_OF_SERVICE} />,
    );
    expect(container.textContent).toBe('Stop out of service');
    expect(
      container.querySelector('.stop-schedule-status.out-of-service'),
    ).not.toBeNull();
  });

  it('renders the effect label when status is ALERT and alertEffects are present', () => {
    const { container } = renderWithProviders(
      <StopScheduleStatus
        status={STOP_STATUS.ALERT}
        alertEffects={['DETOUR']}
      />,
    );
    const labels = container.querySelectorAll('.stop-schedule-status__effect');
    expect(labels).toHaveLength(1);
    expect(labels[0].textContent).toBe('Diversion');
  });

  it('renders nothing when status is ALERT but alertEffects is empty', () => {
    const { container } = renderWithProviders(
      <StopScheduleStatus status={STOP_STATUS.ALERT} alertEffects={[]} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders the effect label when status is INFO and alertEffects are present', () => {
    const { container } = renderWithProviders(
      <StopScheduleStatus
        status={STOP_STATUS.INFO}
        alertEffects={['MODIFIED_SERVICE']}
      />,
    );
    expect(
      container.querySelector('.stop-schedule-status__effect').textContent,
    ).toBe('Service change');
  });

  it('deduplicates repeated effects and renders one label per unique effect', () => {
    const { container } = renderWithProviders(
      <StopScheduleStatus
        status={STOP_STATUS.ALERT}
        alertEffects={['DETOUR', 'DETOUR', 'SIGNIFICANT_DELAYS']}
      />,
    );
    const labels = [
      ...container.querySelectorAll('.stop-schedule-status__effect'),
    ].map(el => el.textContent);
    expect(labels).toEqual(['Diversion', 'Delay']);
  });
});
