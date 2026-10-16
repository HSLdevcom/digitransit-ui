import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import translations from '../../../app/translations/en';
import StopScheduleStatus from '../../../app/component/stop/StopScheduleStatus';
import {
  STOP_STATUS,
  STOP_STATUS_MESSAGE_IDS,
} from '../../../utils/client/stopStatusUtils';

const messages = translations.en;

describe('<StopScheduleStatus />', () => {
  it('renders nothing when status is undefined', () => {
    const { container } = renderWithProviders(<StopScheduleStatus />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the status message when no alertEffects are present', () => {
    const { container } = renderWithProviders(
      <StopScheduleStatus status={STOP_STATUS.OUT_OF_SERVICE} />,
    );
    expect(container.textContent).toBe(
      messages[STOP_STATUS_MESSAGE_IDS[STOP_STATUS.OUT_OF_SERVICE]],
    );
  });

  it('renders the alert effect label when status is ALERT and alertEffects are present', () => {
    const { container } = renderWithProviders(
      <StopScheduleStatus
        status={STOP_STATUS.ALERT}
        alertEffects={['DETOUR']}
      />,
    );
    const labels = container.querySelectorAll('.stop-schedule-status__effect');
    expect(labels).toHaveLength(1);
    expect(labels[0].textContent).toBe(messages['disruption-badge-detour']);
  });

  it('renders nothing when status is ALERT but alertEffects is empty', () => {
    const { container } = renderWithProviders(
      <StopScheduleStatus status={STOP_STATUS.ALERT} alertEffects={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the alert effect label when status is INFO and alertEffects are present', () => {
    const { container } = renderWithProviders(
      <StopScheduleStatus
        status={STOP_STATUS.INFO}
        alertEffects={['MODIFIED_SERVICE']}
      />,
    );
    expect(container.textContent).toBe(
      messages['disruption-badge-modified_service'],
    );
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
    ].map(label => label.textContent);
    expect(labels).toEqual([
      messages['disruption-badge-detour'],
      messages['disruption-badge-significant_delays'],
    ]);
  });
});
