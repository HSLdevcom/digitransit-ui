import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  buildAlertsFingerprint,
  getCanceledModes,
} from '../../../../app/component/trafficnow/Disruptions';

const makeAlert = (id, start, end, severity) => ({
  id,
  effectiveStartDate: start,
  effectiveEndDate: end,
  alertSeverityLevel: severity,
});

const makeRouteSummary = gtfsId => ({
  route: {
    gtfsId,
    shortName: gtfsId,
    id: gtfsId,
    mode: 'BUS',
  },
  cancellationCount: 1,
  patterns: [],
});

describe('buildAlertsFingerprint', () => {
  it('returns an empty string for an empty alert list', () => {
    expect(buildAlertsFingerprint([])).to.equal('');
  });

  it('produces the same fingerprint regardless of input order', () => {
    const a = makeAlert('a1', 1000, 2000, 'WARNING');
    const b = makeAlert('a2', 1001, 2001, 'SEVERE');
    expect(buildAlertsFingerprint([a, b])).to.equal(
      buildAlertsFingerprint([b, a]),
    );
  });

  it('produces a different fingerprint when an alert is added', () => {
    const a = makeAlert('a1', 1000, 2000, 'WARNING');
    const b = makeAlert('a2', 1001, 2001, 'SEVERE');
    expect(buildAlertsFingerprint([a])).to.not.equal(
      buildAlertsFingerprint([a, b]),
    );
  });

  it('produces a different fingerprint when severity changes', () => {
    const before = makeAlert('a1', 1000, 2000, 'WARNING');
    const after = makeAlert('a1', 1000, 2000, 'SEVERE');
    expect(buildAlertsFingerprint([before])).to.not.equal(
      buildAlertsFingerprint([after]),
    );
  });

  it('produces a different fingerprint when effective dates change', () => {
    const before = makeAlert('a1', 1000, 2000, 'WARNING');
    const after = makeAlert('a1', 1000, 3000, 'WARNING');
    expect(buildAlertsFingerprint([before])).to.not.equal(
      buildAlertsFingerprint([after]),
    );
  });
});

describe('getCanceledModes', () => {
  it('filters canceled trip routes by configured feed ids', () => {
    const canceledModes = getCanceledModes(
      {
        bus: {
          routes: [
            makeRouteSummary('HSL:1001'),
            makeRouteSummary('MATKA:2001'),
          ],
        },
      },
      ['HSL'],
    );

    expect(canceledModes).to.deep.equal([
      {
        key: 'bus',
        routes: [makeRouteSummary('HSL:1001')],
      },
    ]);
  });

  it('omits cancellation modes when all routes are filtered out', () => {
    const canceledModes = getCanceledModes(
      {
        bus: {
          routes: [makeRouteSummary('MATKA:2001')],
        },
      },
      ['HSL'],
    );

    expect(canceledModes).to.deep.equal([]);
  });

  it('keeps modes with matching routes and drops modes without', () => {
    const canceledModes = getCanceledModes(
      {
        bus: { routes: [makeRouteSummary('HSL:1001')] },
        tram: { routes: [makeRouteSummary('MATKA:2001')] },
      },
      ['HSL'],
    );

    expect(canceledModes).to.deep.equal([
      { key: 'bus', routes: [makeRouteSummary('HSL:1001')] },
    ]);
  });
});
