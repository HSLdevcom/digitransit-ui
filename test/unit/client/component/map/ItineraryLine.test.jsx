import { act } from '@testing-library/react';
import polyUtil from 'polyline-encoded';
import { LeafletProvider } from 'react-leaflet/es/context';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { createTestConfig } from '../../../helpers/mock-context';
import ItineraryLine from '../../../../../src/client/component/map/ItineraryLine';
import * as LineModule from '../../../../../src/client/component/map/Line';
import * as StopMarkerModule from '../../../../../src/client/component/map/non-tile-layer/StopMarker';
import * as TransitLegMarkersModule from '../../../../../src/client/component/map/non-tile-layer/TransitLegMarkers';
import * as VehicleMarkerModule from '../../../../../src/client/component/map/non-tile-layer/VehicleMarker';
import * as SpeechBubbleModule from '../../../../../src/client/component/map/SpeechBubble';
import * as EntranceMarkerModule from '../../../../../src/client/component/map/EntranceMarker';
import * as IndoorStepMarkerModule from '../../../../../src/client/component/map/IndoorStepMarker';
import * as ClusterNumberMarkerModule from '../../../../../src/client/component/map/ClusterNumberMarker';

// Stubs expose the props that ItineraryLine decides, as JSON in the DOM.
const stub = name => {
  const Stub = props => <div data-testid={name} data-props={JSON.stringify(props)} />;
  return Stub;
};

const props = el => JSON.parse(el.dataset.props);
const all = (container, name) =>
  [...container.querySelectorAll(`[data-testid="${name}"]`)].map(props);

const encode = points => polyUtil.encode(points);
const WALK_POINTS = [
  [60.1, 24.9],
  [60.11, 24.91],
  [60.12, 24.92],
];
const BUS_POINTS = [
  [60.12, 24.92],
  [60.2, 25.0],
];

const place = (lat, lon, extra = {}) => ({ lat, lon, name: 'p', ...extra });
const busStop = (gtfsId, extra = {}) => ({
  gtfsId,
  code: gtfsId,
  platformCode: null,
  vehicleMode: 'BUS',
  ...extra,
});

const walkLeg = (extra = {}) => ({
  mode: 'WALK',
  transitLeg: false,
  duration: 300,
  distance: 400,
  legGeometry: { points: encode(WALK_POINTS) },
  from: place(60.1, 24.9),
  to: place(60.12, 24.92),
  ...extra,
});

const busLeg = (extra = {}) => ({
  mode: 'BUS',
  transitLeg: true,
  duration: 1200,
  distance: 5000,
  legGeometry: { points: encode(BUS_POINTS) },
  from: place(60.12, 24.92, { stop: busStop('HSL:1') }),
  to: place(60.2, 25.0, { stop: busStop('HSL:2') }),
  route: {
    gtfsId: 'HSL:R1',
    shortName: '55',
    type: 3,
    color: '00ff00',
    agency: { gtfsId: 'HSL:A' },
  },
  trip: { gtfsId: 'HSL:T1' },
  ...extra,
});

describe('<ItineraryLine />', () => {
  let zoom;
  let zoomListeners;
  let map;

  beforeEach(() => {
    zoom = 14;
    zoomListeners = [];
    map = {
      getZoom: () => zoom,
      on: (event, fn) => event === 'zoomend' && zoomListeners.push(fn),
      off: (event, fn) => {
        zoomListeners = zoomListeners.filter(l => l !== fn);
      },
    };
    vi.spyOn(LineModule, 'default', 'get').mockReturnValue(stub('line'));
    vi.spyOn(StopMarkerModule, 'default', 'get').mockReturnValue(stub('stop'));
    vi.spyOn(TransitLegMarkersModule, 'default', 'get').mockReturnValue(stub('transit-markers'));
    vi.spyOn(VehicleMarkerModule, 'default', 'get').mockReturnValue(stub('vehicle'));
    vi.spyOn(SpeechBubbleModule, 'default', 'get').mockReturnValue(stub('bubble'));
    vi.spyOn(EntranceMarkerModule, 'default', 'get').mockReturnValue(stub('entrance'));
    vi.spyOn(IndoorStepMarkerModule, 'default', 'get').mockReturnValue(stub('indoor-step'));
    vi.spyOn(ClusterNumberMarkerModule, 'default', 'get').mockReturnValue(stub('cluster'));
  });

  const render = (legs, itineraryProps = {}, config = createTestConfig()) =>
    renderWithProviders(
      <LeafletProvider value={{ map }}>
        <ItineraryLine legs={legs} {...itineraryProps} />
      </LeafletProvider>,
      { config },
    );

  describe('lines', () => {
    it('draws one line per leg using the decoded leg geometry and route color', () => {
      const { container } = render([walkLeg(), busLeg()]);
      const lines = all(container, 'line');
      expect(lines).toHaveLength(2);
      expect(lines[0].mode).toBe('walk');
      expect(lines[0].color).toBeNull();
      expect(lines[0].geometry).toEqual(WALK_POINTS);
      expect(lines[1].mode).toBe('bus');
      expect(lines[1].color).toBe('#00ff00');
      expect(lines[1].geometry).toEqual(BUS_POINTS);
    });

    it('skips missing and waiting legs', () => {
      const { container } = render([null, walkLeg({ mode: 'WAIT' }), walkLeg()]);
      expect(all(container, 'line')).toHaveLength(1);
    });

    it('draws the lines passively without any markers when passive', () => {
      const { container } = render([walkLeg(), busLeg()], { passive: true });
      expect(all(container, 'line').every(l => l.passive)).toBe(true);
      expect(all(container, 'stop')).toHaveLength(0);
      expect(all(container, 'transit-markers')).toHaveLength(0);
    });

    it('draws rented bike legs as citybike but leaves walking on foot', () => {
      const { container } = render([
        walkLeg({ rentedBike: true }),
        busLeg({ mode: 'BICYCLE', transitLeg: false, rentedBike: true, route: null, trip: null }),
      ]);
      expect(all(container, 'line').map(l => l.mode)).toEqual(['walk', 'citybike']);
    });

    it('marks call agency legs of local agencies', () => {
      const config = createTestConfig({ flex: { internal: { agencies: ['HSL:A'] } } });
      const callLeg = busLeg({ route: { ...busLeg().route, type: 715 } });
      const { container } = render([callLeg], {}, config);
      expect(all(container, 'line')[0].appendClass).toBe('call-local');
    });

    it('does not mark ordinary legs as local call agency', () => {
      const { container } = render([busLeg()]);
      expect(all(container, 'line')[0].appendClass).toBe('');
    });
  });

  describe('duration bubble', () => {
    it('shows the duration of every leg when requested', () => {
      const { container } = render([walkLeg(), busLeg()], { showDurationBubble: true });
      const bubbles = all(container, 'bubble');
      expect(bubbles.map(b => b.text)).toEqual(['5 min', '20 min']);
      // the bubble sits at the middle of the leg geometry
      expect(bubbles[1].position.lat).toBeCloseTo(60.16, 3);
      expect(bubbles[1].position.lon).toBeCloseTo(24.96, 3);
    });

    it('shows it for long enough legs of the chosen street mode only', () => {
      const long = walkLeg({ distance: 101 });
      const short = walkLeg({ distance: 100 });
      const bike = walkLeg({ mode: 'BICYCLE', distance: 500 });
      expect(
        all(render([long, short, bike], { streetMode: 'walk' }).container, 'bubble'),
      ).toHaveLength(1);
      expect(all(render([short, bike], { streetMode: 'bike' }).container, 'bubble')).toHaveLength(
        1,
      );
      expect(all(render([long, bike]).container, 'bubble')).toHaveLength(0);
    });
  });

  describe('intermediate stops', () => {
    const stopCalls = [
      { stopLocation: busStop('HSL:1') },
      { stopLocation: busStop('HSL:i1') },
      { stopLocation: null },
      { stopLocation: busStop('HSL:i2') },
      { stopLocation: busStop('HSL:2') },
    ];

    it('adds markers for the stops between the end stops', () => {
      const { container } = render([busLeg({ stopCalls })], { showIntermediateStops: true });
      const ids = all(container, 'stop')
        .filter(s => s.thin)
        .map(s => s.stop.gtfsId);
      expect(ids).toEqual(['HSL:i1', 'HSL:i2']);
    });

    it('omits them by default and when passive', () => {
      const thin = c => all(c, 'stop').filter(s => s.thin);
      expect(thin(render([busLeg({ stopCalls })]).container)).toHaveLength(0);
      expect(
        thin(
          render([busLeg({ stopCalls })], { showIntermediateStops: true, passive: true }).container,
        ),
      ).toHaveLength(0);
    });
  });

  describe('transit markers', () => {
    it('marks the start and end stop of a transit leg', () => {
      const { container } = render([busLeg()]);
      const stops = all(container, 'stop');
      expect(stops.map(s => s.stop.gtfsId)).toEqual(['HSL:1', 'HSL:2']);
      expect(stops.every(s => s.stop.transfer && s.mode === 'bus')).toBe(true);
    });

    it('does not mark stops of taxi and call agency legs', () => {
      const callLeg = busLeg({ route: { ...busLeg().route, type: 715 } });
      const { container } = render([callLeg]);
      expect(all(container, 'stop')).toHaveLength(0);
    });

    it('passes transit legs and the realtime setting to the leg markers', () => {
      const { container } = render([walkLeg(), busLeg()], { realtimeTransfers: true });
      const [markers] = all(container, 'transit-markers');
      expect(markers.realtimeTransfers).toBe(true);
      expect(markers.transitLegs).toHaveLength(1);
      expect(markers.transitLegs[0]).toMatchObject({ index: 1, mode: 'bus' });
    });

    it('treats interlined legs as one transit leg ending where the last one ends', () => {
      const second = busLeg({
        interlineWithPreviousLeg: true,
        legGeometry: {
          points: encode([
            [60.2, 25.0],
            [60.3, 25.1],
          ]),
        },
        from: place(60.2, 25.0, { stop: busStop('HSL:2') }),
        to: place(60.3, 25.1, { stop: busStop('HSL:3') }),
        end: { scheduledTime: '2' },
        route: { ...busLeg().route, shortName: '56' },
      });
      const { container } = render([busLeg(), second]);
      const [markers] = all(container, 'transit-markers');
      expect(markers.transitLegs).toHaveLength(1);
      expect(markers.transitLegs[0].to.stop.gtfsId).toBe('HSL:3');
      expect(markers.transitLegs[0].interliningWithRoute).toBe('56');
      // both legs still get their own line
      expect(all(container, 'line')).toHaveLength(2);
    });

    it('shows a rental vehicle marker at the start of a rented leg', () => {
      const rentalLeg = walkLeg({
        mode: 'BICYCLE',
        from: place(60.1, 24.9, {
          vehicleRentalStation: {
            stationId: 'st1',
            availableVehicles: { bicycles: 3 },
            rentalNetwork: { networkId: 'smoove' },
          },
        }),
      });
      const { container } = render([rentalLeg]);
      const [vehicle] = all(container, 'vehicle');
      expect(vehicle.showBikeAvailability).toBe(true);
      expect(vehicle.rental).toMatchObject({ id: 'st1', network: 'smoove', lat: 60.1, lon: 24.9 });
    });
  });

  describe('indoor entrances', () => {
    const subwayLeg = busLeg({ mode: 'SUBWAY', route: { ...busLeg().route, type: 1 } });
    const entranceStep = {
      lat: 60.11,
      lon: 24.91,
      feature: { __typename: 'Entrance', publicCode: 'A', wheelchairAccessible: 'POSSIBLE' },
    };
    const exitWalk = walkLeg({ steps: [entranceStep] });

    it('splits a walk from the subway at the entrance into an indoor and outdoor line', () => {
      const { container } = render([subwayLeg, exitWalk]);
      const lines = all(container, 'line').slice(1);
      expect(lines.map(l => l.mode)).toEqual(['walk-inside', 'walk']);
      // the parts share the entrance point
      expect(lines[0].geometry.at(-1)).toEqual(lines[1].geometry[0]);
      expect(lines[0].geometry.at(-1)).toEqual([60.11, 24.91]);
    });

    it('makes the part after the entrance indoor when walking into the subway', () => {
      const { container } = render([exitWalk, subwayLeg]);
      expect(
        all(container, 'line')
          .map(l => l.mode)
          .slice(0, 2),
      ).toEqual(['walk', 'walk-inside']);
    });

    it('shows an entrance marker only when zoomed in and not passive', () => {
      expect(all(render([subwayLeg, exitWalk]).container, 'entrance')).toHaveLength(1);
      zoom = 13;
      expect(all(render([subwayLeg, exitWalk]).container, 'entrance')).toHaveLength(0);
      zoom = 14;
      expect(
        all(render([subwayLeg, exitWalk], { passive: true }).container, 'entrance'),
      ).toHaveLength(0);
    });

    it('merges close indoor markers into a numbered cluster', () => {
      const lift = {
        lat: 60.11,
        lon: 24.9101,
        feature: { __typename: 'ElevatorUse', verticalDirection: 'UP' },
      };
      const leg = walkLeg({ steps: [lift, entranceStep] });
      const { container } = render([subwayLeg, leg]);
      expect(all(container, 'cluster')).toHaveLength(1);
      expect(all(container, 'entrance')).toHaveLength(0);
    });
  });

  it('re-evaluates zoom dependent markers when the map zoom changes', () => {
    const subwayLeg = busLeg({ mode: 'SUBWAY', route: { ...busLeg().route, type: 1 } });
    const exitWalk = walkLeg({
      steps: [{ lat: 60.11, lon: 24.91, feature: { __typename: 'Entrance' } }],
    });
    zoom = 12;
    const { container, unmount } = render([subwayLeg, exitWalk]);
    expect(all(container, 'entrance')).toHaveLength(0);
    zoom = 15;
    act(() => zoomListeners.forEach(fn => fn()));
    expect(all(container, 'entrance')).toHaveLength(1);
    unmount();
    expect(zoomListeners).toHaveLength(0);
  });
});
