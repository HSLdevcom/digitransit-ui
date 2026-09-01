import { expect } from 'chai';
import { describe, it } from 'mocha';
import { getCanceledModes } from '../../../../app/component/trafficnow/Disruptions';

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
});
