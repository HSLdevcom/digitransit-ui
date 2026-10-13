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

function buildTransitLegWithAlert(legId, startMs, endMs, alert) {
  const t = ms => ({ scheduledTime: epochToIso(ms) });
  return {
    legId,
    mode: 'BUS',
    transitLeg: true,
    realtimeState: 'SCHEDULED',
    alerts: [alert],
    route: { shortName: '55' },
    start: t(startMs),
    end: t(endMs),
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

  it('shows the same alert only once even when it affects several upcoming transit legs', () => {
    const sharedAlert = {
      id: 'alert-1',
      alertSeverityLevel: 'ALERT',
      alertHeaderText: 'Shared disruption',
      effectiveStartDate: (NOW - 60 * 60000) / 1000,
      effectiveEndDate: (NOW + 60 * 60000) / 1000,
    };
    const legs = [
      buildTransitLegWithAlert(
        'leg-1',
        NOW + 5 * 60000,
        NOW + 15 * 60000,
        sharedAlert,
      ),
      buildTransitLegWithAlert(
        'leg-2',
        NOW + 20 * 60000,
        NOW + 30 * 60000,
        sharedAlert,
      ),
    ];

    const alerts = getItineraryAlerts(
      legs,
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

    const matching = alerts.filter(a => a.title === 'Shared disruption');
    expect(matching.length).to.equal(1);
    // the surviving card keeps the id of whichever leg produced it first,
    // preserving per-leg update-in-place semantics for that leg's slot
    expect(matching[0].id).to.equal('alert-leg-1');
    // deliberately no expiresOn: alert.effectiveEndDate is not reliable
    // enough to auto-dismiss on (the feed can keep serving an outdated
    // alert for a while after its real status has changed), so these
    // cards stay until the user manually closes them, same as before
    expect(matching[0].expiresOn).to.be.undefined; // eslint-disable-line no-unused-expressions
  });

  it('still lets a later leg show the alert once the earlier leg stops reporting it', () => {
    const sharedAlert = {
      id: 'alert-1',
      alertSeverityLevel: 'ALERT',
      alertHeaderText: 'Shared disruption',
      effectiveStartDate: (NOW - 60 * 60000) / 1000,
      effectiveEndDate: (NOW + 60 * 60000) / 1000,
    };
    const leg1 = buildTransitLegWithAlert(
      'leg-1',
      NOW + 5 * 60000,
      NOW + 15 * 60000,
      sharedAlert,
    );
    const leg2 = buildTransitLegWithAlert(
      'leg-2',
      NOW + 20 * 60000,
      NOW + 30 * 60000,
      sharedAlert,
    );
    // leg1 no longer reports the alert (e.g. it cleared for that leg)
    leg1.alerts = [];

    const alerts = getItineraryAlerts(
      [leg1, leg2],
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

    const matching = alerts.filter(a => a.title === 'Shared disruption');
    expect(matching.length).to.equal(1);
    expect(matching[0].id).to.equal('alert-leg-2');
  });

  it('keeps an alert dismissed on a later leg even though it was only closed on an earlier leg', () => {
    const sharedAlert = {
      id: 'alert-1',
      alertSeverityLevel: 'ALERT',
      alertHeaderText: 'Shared disruption',
      effectiveStartDate: (NOW - 60 * 60000) / 1000,
      effectiveEndDate: (NOW + 60 * 60000) / 1000,
    };
    const leg1 = buildTransitLegWithAlert(
      'leg-1',
      NOW + 5 * 60000,
      NOW + 15 * 60000,
      sharedAlert,
    );
    const leg2 = buildTransitLegWithAlert(
      'leg-2',
      NOW + 20 * 60000,
      NOW + 30 * 60000,
      sharedAlert,
    );
    // leg1 no longer reports the alert, but the user already dismissed the
    // card that was shown for it (tracked by the alert's own identity)
    leg1.alerts = [];
    const messages = new Map([
      ['alert-leg-1', { id: 'alert-leg-1', alertKey: 'alert-1', closed: true }],
    ]);

    const alerts = getItineraryAlerts(
      [leg1, leg2],
      NOW,
      null,
      0,
      mockIntl,
      messages,
      () => {},
      config,
      { minTransferTime: 180 },
      undefined,
      PLATFORM_STATUS.NORMAL,
    );

    const matching = alerts.filter(a => a.title === 'Shared disruption');
    expect(matching.length).to.equal(0);
  });
});
