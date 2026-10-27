import React from 'react';

import Itinerary from '../../../../../app/component/itinerary/Itinerary';
import Legs from '../../../../../app/component/itinerary/Legs';
import { AlertSeverityLevelType } from '../../../../../utils/shared/constants';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { ignoreRelayModernSelectorWarning } from '../../../helpers/relay-selector-warning';

// The summary row (Itinerary) and the details (Legs) are rendered from the
// same itinerary and must agree on whether an alert is shown.
const startMs = 1553769600000;
const iso = offsetMin => new Date(startMs + offsetMin * 60000).toISOString();

const stopAlert = {
  alertSeverityLevel: AlertSeverityLevelType.Warning,
  alertHeaderText: 'Stop closed',
  alertDescriptionText: 'Stop closed',
  effectiveStartDate: startMs / 1000 - 3600,
  effectiveEndDate: startMs / 1000 + 7200,
  entities: [{ __typename: 'Stop', gtfsId: 'HSL:X' }],
};

const stop = (gtfsId, alerts = []) => ({
  gtfsId,
  name: gtfsId,
  code: gtfsId,
  zoneId: 'A',
  alerts,
});

const busLeg = ({ from, to, startMin, endMin, route, interline = false }) => ({
  mode: 'BUS',
  transitLeg: true,
  interlineWithPreviousLeg: interline,
  duration: (endMin - startMin) * 60,
  distance: 1000,
  intermediatePlaces: [],
  from: { name: from.gtfsId, lat: 60, lon: 24, stop: from },
  to: { name: to.gtfsId, lat: 60, lon: 24, stop: to },
  start: { scheduledTime: iso(startMin) },
  end: { scheduledTime: iso(endMin) },
  route: { gtfsId: `HSL:${route}`, shortName: route, mode: 'BUS', alerts: [] },
  trip: {
    gtfsId: `HSL:${route}_trip`,
    tripHeadsign: 'Somewhere',
    pattern: { code: `HSL:${route}:0:01` },
    stoptimesForDate: [],
  },
});

const walkLeg = ({ from, startMin, endMin }) => ({
  mode: 'WALK',
  transitLeg: false,
  duration: (endMin - startMin) * 60,
  distance: 300,
  intermediatePlaces: [],
  from: { name: from.gtfsId, lat: 60, lon: 24, stop: from },
  to: { name: 'Destination', lat: 60, lon: 24 },
  start: { scheduledTime: iso(startMin) },
  end: { scheduledTime: iso(endMin) },
});

const config = {
  CONFIG: 'hsl',
  itinerary: { waitThreshold: 180 },
  zones: { itinerary: true },
  feedIds: ['HSL'],
  colors: { primary: 'ffffff' },
  language: 'fi',
};

describe('itinerary list and details alert parity', () => {
  ignoreRelayModernSelectorWarning();

  const renderBoth = legs => {
    const itinerary = { start: iso(0), end: iso(60), legs };
    const list = renderWithProviders(
      <Itinerary
        breakpoint="large"
        hash={1}
        focusToHeader={() => {}}
        refTime={0}
        itinerary={itinerary}
      />,
    ).container;
    const details = renderWithProviders(
      <Legs
        itinerary={itinerary}
        focusToPoint={() => {}}
        focusToLeg={() => {}}
        openSettings={() => {}}
        changeHash={() => {}}
        tabIndex={0}
        usingOwnCarWholeTrip={false}
      />,
      { config },
    ).container;
    return {
      listShowsAlert: !!list.querySelector('.subicon-caution'),
      detailsShowAlert: !!details.querySelector('.inline-icon.caution'),
    };
  };

  it('should agree when the alert is at the "to" stop of a single transit leg', () => {
    const origin = stop('HSL:A');
    const alerted = stop('HSL:X', [stopAlert]);
    const { listShowsAlert, detailsShowAlert } = renderBoth([
      busLeg({
        from: origin,
        to: alerted,
        startMin: 0,
        endMin: 30,
        route: '1',
      }),
      walkLeg({ from: alerted, startMin: 30, endMin: 40 }),
    ]);
    expect(detailsShowAlert).toBe(true);
    expect(listShowsAlert).toBe(detailsShowAlert);
  });

  it('should agree when the alert is at the interlining stop of interlined legs', () => {
    const origin = stop('HSL:A');
    const middle = stop('HSL:X', [stopAlert]);
    const last = stop('HSL:B');
    const { listShowsAlert, detailsShowAlert } = renderBoth([
      busLeg({ from: origin, to: middle, startMin: 0, endMin: 15, route: '1' }),
      busLeg({
        from: middle,
        to: last,
        startMin: 15,
        endMin: 30,
        route: '2',
        interline: true,
      }),
      walkLeg({ from: last, startMin: 30, endMin: 40 }),
    ]);
    expect(detailsShowAlert).toBe(true);
    expect(listShowsAlert).toBe(detailsShowAlert);
  });
});
