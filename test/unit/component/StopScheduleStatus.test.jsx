import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import StopScheduleStatus from '../../../app/component/stop/StopScheduleStatus';
import { STOP_STATUS } from '../../../utils/client/stopStatusUtils';

describe('<StopScheduleStatus />', () => {
  it('renders nothing when no status is provided', () => {
    const { container } = renderWithProviders(<StopScheduleStatus />);

    expect(container.firstChild).toBeNull();
  });

  it('renders an out-of-service status', () => {
    const { container } = renderWithProviders(
      <StopScheduleStatus status={STOP_STATUS.OUT_OF_SERVICE} />,
    );

    expect(
      container.querySelector('.stop-schedule-status.out-of-service'),
    ).not.toBeNull();
  });

  it('renders one label for each unique alert effect', () => {
    const { container } = renderWithProviders(
      <StopScheduleStatus
        status={STOP_STATUS.ALERT}
        alertEffects={['DETOUR', 'DETOUR', 'SIGNIFICANT_DELAYS']}
      />,
    );

    expect(
      container.querySelectorAll('.stop-schedule-status__effect'),
    ).toHaveLength(2);
  });
});
