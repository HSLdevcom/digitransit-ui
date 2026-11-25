import {
  STOP_CALL_STATUS,
  resolveMarkerBadge,
} from '../../../../src/client/utils/stopCallStatusUtils';
import { STOP_STATUS } from '../../../../src/client/utils/stopStatusUtils';

describe('stopCallStatusUtils', () => {
  it('shows the canceled badge for a canceled call', () => {
    expect(resolveMarkerBadge(STOP_CALL_STATUS.CANCELED, null)).toEqual({
      status: 'canceled',
      badgeImg: 'icon_canceled-stop',
    });
  });

  it('prefers the call status over the stop status', () => {
    expect(resolveMarkerBadge(STOP_CALL_STATUS.CANCELED, STOP_STATUS.ALERT).status).toBe(
      'canceled',
    );
  });

  it('falls back to the stop status without a call status', () => {
    expect(resolveMarkerBadge(null, STOP_STATUS.ALERT).status).toBe(STOP_STATUS.ALERT);
  });

  it('returns null when nothing applies', () => {
    expect(resolveMarkerBadge(null, null)).toBeNull();
  });
});
