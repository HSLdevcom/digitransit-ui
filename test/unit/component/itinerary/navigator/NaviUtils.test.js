import { expect } from 'chai';
import { getItineraryAlerts } from '../../../../../app/component/itinerary/navigator/NaviUtils';
import { legTime, PLATFORM_STATUS } from '../../../../../utils/client/legUtils';
import { epochToIso } from '../../../../../utils/client/timeUtils';
import config from '../../../../../server/configs/config.default';

const NOW = Date.parse('2024-05-01T12:00:00Z');

const mockIntl = {
  formatMessage: ({ id }) => id,
};

function buildCanceledLeg() {
  const t = ms => ({ scheduledTime: epochToIso(ms) });
  return {
    legId: 'leg-canceled',
    mode: 'BUS',
    transitLeg: true,
    realtimeState: 'CANCELED',
    alerts: [],
    route: { shortName: '55' },
    start: t(NOW + 5 * 60000),
    end: t(NOW + 15 * 60000),
  };
}

describe('getItineraryAlerts', () => {
  it('gives canceled-trip alerts a real expiry time so they eventually disappear', () => {
    const leg = buildCanceledLeg();

    const alerts = getItineraryAlerts(
      [leg],
      NOW,
      null,
      0,
      mockIntl,
      new Map(),
      () => {},
      config,
      { minTransferTime: 180 },
      undefined,
      PLATFORM_STATUS.NORMAL,
    );

    const canceledAlert = alerts.find(a => a.id === `canceled-${leg.legId}`);
    expect(canceledAlert).to.exist; // eslint-disable-line no-unused-expressions
    expect(canceledAlert.expiresOn).to.be.a('number');
    expect(canceledAlert.expiresOn).to.equal(legTime(leg.start));
  });
});
