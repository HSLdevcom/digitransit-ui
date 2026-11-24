import { getItineraryLegSummary } from '../../../../../src/client/component/itinerary/itineraryUtils';
import buildItineraryLegStrip from '../../../../../src/client/component/itinerary/buildItineraryLegStrip';
import { mockContext } from '../../../helpers/mock-context';

const startTime = Date.parse('2026-01-01T10:00:00Z');
const MIN = 60000;

const config = {
  ...mockContext.config,
  bikeBoardingModes: { RAIL: {} },
  carBoardingModes: {},
  vehicleRental: {
    networks: {
      testnet: { timeBeforeSurcharge: 1800, durationInstructions: 'x', icon: 'citybike' },
    },
  },
};

const makeLeg = (mode, startMin, durationMin, overrides = {}) => ({
  mode,
  duration: durationMin * 60,
  from: { name: `from ${startMin}` },
  to: { name: `to ${startMin}` },
  start: { scheduledTime: new Date(startTime + startMin * MIN).toISOString() },
  end: { scheduledTime: new Date(startTime + (startMin + durationMin) * MIN).toISOString() },
  ...(mode === 'RAIL' || mode === 'BUS'
    ? { transitLeg: true, route: { mode, shortName: `${mode}1`, alerts: [] } }
    : {}),
  ...overrides,
});

const element = el => {
  const { leg, ...props } = el.props;
  const rounded = Object.fromEntries(
    Object.entries(props).map(([k, v]) => [k, typeof v === 'number' ? Math.round(v * 10) / 10 : v]),
  );
  return {
    type: el.type.displayName || el.type.name,
    key: el.key,
    leg: leg && `${leg.mode}`,
    ...rounded,
  };
};

const buildStrip = (legs, intermediatePlaces = []) => {
  const itinerary = { legs };
  const summary = getItineraryLegSummary({
    legs,
    intermediatePlaces,
    config,
    breakpoint: 'large',
    duration: legs.reduce((sum, l) => sum + l.duration * 1000, 0),
  });
  const result = buildItineraryLegStrip({
    ...summary,
    itinerary,
    config,
    formatMessage: ({ id }) => id,
  });
  return {
    elements: result.legs.map(element),
    iconLegsInPixels: Math.round(result.iconLegsInPixels * 10) / 10,
    vehicleNames: result.vehicleNames,
    stopNames: result.stopNames,
    bikeNetwork: result.bikeNetwork,
    citybikeNetworkCount: result.citybikeNetworkCount,
    showRentalBikeDurationWarning: result.showRentalBikeDurationWarning,
    citybikeicon: result.citybikeicon,
  };
};

describe('buildItineraryLegStrip', () => {
  it('walk, rail, walk, bus', () => {
    expect(
      buildStrip([
        makeLeg('WALK', 0, 5),
        makeLeg('RAIL', 5, 20),
        makeLeg('WALK', 25, 5),
        makeLeg('BUS', 30, 20),
      ]),
    ).toMatchInlineSnapshot(`
      {
        "bikeNetwork": undefined,
        "citybikeNetworkCount": 0,
        "citybikeicon": undefined,
        "elements": [
          {
            "duration": 5,
            "icon": undefined,
            "key": "WALK_1767261600000",
            "leg": "WALK",
            "legLength": 10,
            "mode": "walk",
            "parkingIndicator": undefined,
            "renderModeIcons": true,
            "type": "ItineraryStreetLeg",
          },
          {
            "fitRouteNumber": true,
            "hasOneTransitLeg": false,
            "interliningWithRoute": undefined,
            "key": "RAIL_1767261900000",
            "leg": "RAIL",
            "legLength": 40,
            "shortenLabels": false,
            "type": "TransitBar",
            "withBicycle": false,
            "withCar": false,
          },
          {
            "duration": 5,
            "icon": undefined,
            "key": "WALK_1767263100000",
            "leg": "WALK",
            "legLength": 10,
            "mode": "walk",
            "parkingIndicator": undefined,
            "renderModeIcons": true,
            "type": "ItineraryStreetLeg",
          },
          {
            "fitRouteNumber": true,
            "hasOneTransitLeg": false,
            "interliningWithRoute": undefined,
            "key": "BUS_1767263400000",
            "leg": "BUS",
            "legLength": 40,
            "shortenLabels": false,
            "type": "TransitBar",
            "withBicycle": false,
            "withCar": false,
          },
        ],
        "iconLegsInPixels": 0,
        "showRentalBikeDurationWarning": false,
        "stopNames": [
          "from 5",
          "from 30",
        ],
        "vehicleNames": [
          "rail RAIL1",
          "bus BUS1",
        ],
      }
    `);
  });

  it('long wait between transit legs', () => {
    expect(buildStrip([makeLeg('RAIL', 0, 20), makeLeg('BUS', 40, 20)])).toMatchInlineSnapshot(`
      {
        "bikeNetwork": undefined,
        "citybikeNetworkCount": 0,
        "citybikeicon": undefined,
        "elements": [
          {
            "fitRouteNumber": true,
            "hasOneTransitLeg": false,
            "interliningWithRoute": undefined,
            "key": "RAIL_1767261600000",
            "leg": "RAIL",
            "legLength": 50,
            "shortenLabels": false,
            "type": "TransitBar",
            "withBicycle": false,
            "withCar": false,
          },
          {
            "duration": 20,
            "icon": "icon_wait_standing",
            "key": "RAIL_1767261600000_wait",
            "leg": "RAIL",
            "legLength": 50,
            "mode": "WAIT",
            "renderModeIcons": true,
            "type": "StreetBar",
          },
          {
            "fitRouteNumber": true,
            "hasOneTransitLeg": false,
            "interliningWithRoute": undefined,
            "key": "BUS_1767264000000",
            "leg": "BUS",
            "legLength": 50,
            "shortenLabels": false,
            "type": "TransitBar",
            "withBicycle": false,
            "withCar": false,
          },
        ],
        "iconLegsInPixels": 0,
        "showRentalBikeDurationWarning": false,
        "stopNames": [
          "from 0",
          "from 40",
        ],
        "vehicleNames": [
          "rail RAIL1",
          "bus BUS1",
        ],
      }
    `);
  });

  it('via points', () => {
    const viaTo = { name: 'via', viaLocationType: 'VISIT' };
    expect(
      buildStrip(
        [
          makeLeg('WALK', 0, 10, { to: viaTo }),
          makeLeg('RAIL', 15, 20, { from: { name: 'via', viaLocationType: 'VISIT' } }),
        ],
        [{ lat: 1, lon: 1 }],
      ),
    ).toMatchInlineSnapshot(`
      {
        "bikeNetwork": undefined,
        "citybikeNetworkCount": 0,
        "citybikeicon": undefined,
        "elements": [
          {
            "duration": 10,
            "icon": undefined,
            "key": "WALK_1767261600000",
            "leg": "WALK",
            "legLength": 40,
            "mode": "walk",
            "parkingIndicator": undefined,
            "renderModeIcons": true,
            "type": "ItineraryStreetLeg",
          },
          {
            "key": "via_RAIL_1767262500000",
            "leg": undefined,
            "type": "ViaPoint",
          },
          {
            "fitRouteNumber": true,
            "hasOneTransitLeg": true,
            "interliningWithRoute": undefined,
            "key": "RAIL_1767262500000",
            "leg": "RAIL",
            "legLength": 80,
            "shortenLabels": false,
            "type": "TransitBar",
            "withBicycle": false,
            "withCar": false,
          },
        ],
        "iconLegsInPixels": 12,
        "showRentalBikeDurationWarning": false,
        "stopNames": [
          "via",
        ],
        "vehicleNames": [
          "rail RAIL1",
        ],
      }
    `);
  });

  it('own bicycle parked, then rail', () => {
    expect(
      buildStrip([
        makeLeg('BICYCLE', 0, 10, { rentedBike: false, to: { vehicleParking: true } }),
        makeLeg('WALK', 10, 5),
        makeLeg('RAIL', 15, 20),
      ]),
    ).toMatchInlineSnapshot(`
      {
        "bikeNetwork": undefined,
        "citybikeNetworkCount": 0,
        "citybikeicon": undefined,
        "elements": [
          {
            "duration": 10,
            "icon": undefined,
            "key": "BICYCLE_1767261600000",
            "leg": "BICYCLE",
            "legLength": 28.6,
            "mode": "BICYCLE",
            "parkingIndicator": "bike",
            "renderModeIcons": true,
            "type": "ItineraryStreetLeg",
          },
          {
            "duration": 5,
            "icon": undefined,
            "key": "WALK_1767262200000",
            "leg": "WALK",
            "legLength": 14.3,
            "mode": "walk",
            "parkingIndicator": undefined,
            "renderModeIcons": true,
            "type": "ItineraryStreetLeg",
          },
          {
            "fitRouteNumber": true,
            "hasOneTransitLeg": true,
            "interliningWithRoute": undefined,
            "key": "RAIL_1767262500000",
            "leg": "RAIL",
            "legLength": 57.1,
            "shortenLabels": false,
            "type": "TransitBar",
            "withBicycle": false,
            "withCar": false,
          },
        ],
        "iconLegsInPixels": 12,
        "showRentalBikeDurationWarning": false,
        "stopNames": [
          "from 15",
        ],
        "vehicleNames": [
          "rail RAIL1",
        ],
      }
    `);
  });

  it('own bicycle whole trip with rail', () => {
    expect(buildStrip([makeLeg('BICYCLE', 0, 10, { rentedBike: false }), makeLeg('RAIL', 10, 20)]))
      .toMatchInlineSnapshot(`
      {
        "bikeNetwork": undefined,
        "citybikeNetworkCount": 0,
        "citybikeicon": undefined,
        "elements": [
          {
            "duration": 10,
            "icon": undefined,
            "key": "BICYCLE_1767261600000",
            "leg": "BICYCLE",
            "legLength": 33.3,
            "mode": "BICYCLE",
            "parkingIndicator": undefined,
            "renderModeIcons": true,
            "type": "ItineraryStreetLeg",
          },
          {
            "fitRouteNumber": true,
            "hasOneTransitLeg": true,
            "interliningWithRoute": undefined,
            "key": "RAIL_1767262200000",
            "leg": "RAIL",
            "legLength": 66.7,
            "shortenLabels": false,
            "type": "TransitBar",
            "withBicycle": true,
            "withCar": false,
          },
        ],
        "iconLegsInPixels": 0,
        "showRentalBikeDurationWarning": false,
        "stopNames": [
          "from 10",
        ],
        "vehicleNames": [
          "rail RAIL1",
        ],
      }
    `);
  });

  it('own car with parking', () => {
    expect(
      buildStrip([makeLeg('CAR', 0, 20, { to: { vehicleParking: true } }), makeLeg('WALK', 20, 5)]),
    ).toMatchInlineSnapshot(`
      {
        "bikeNetwork": undefined,
        "citybikeNetworkCount": 0,
        "citybikeicon": undefined,
        "elements": [
          {
            "duration": 20,
            "icon": "icon_car",
            "key": "CAR_1767261600000",
            "leg": "CAR",
            "legLength": 80,
            "mode": "CAR",
            "parkingIndicator": "car",
            "renderModeIcons": undefined,
            "type": "ItineraryStreetLeg",
          },
          {
            "duration": 5,
            "icon": undefined,
            "key": "WALK_1767262800000",
            "leg": "WALK",
            "legLength": 20,
            "mode": "walk",
            "parkingIndicator": undefined,
            "renderModeIcons": true,
            "type": "ItineraryStreetLeg",
          },
        ],
        "iconLegsInPixels": 24,
        "showRentalBikeDurationWarning": false,
        "stopNames": [],
        "vehicleNames": [],
      }
    `);
  });

  it('rented city bike over surcharge limit', () => {
    expect(
      buildStrip([
        makeLeg('BICYCLE', 0, 40, {
          rentedBike: true,
          from: {
            name: 'station',
            vehicleRentalStation: { rentalNetwork: { networkId: 'testnet' } },
          },
        }),
        makeLeg('RAIL', 40, 20),
      ]),
    ).toMatchInlineSnapshot(`
      {
        "bikeNetwork": "testnet",
        "citybikeNetworkCount": 1,
        "citybikeicon": "icon_citybike",
        "elements": [
          {
            "duration": 40,
            "icon": undefined,
            "key": "BICYCLE_1767261600000",
            "leg": "BICYCLE",
            "legLength": 66.7,
            "mode": "CITYBIKE",
            "parkingIndicator": undefined,
            "renderModeIcons": true,
            "type": "ItineraryStreetLeg",
          },
          {
            "fitRouteNumber": true,
            "hasOneTransitLeg": true,
            "interliningWithRoute": undefined,
            "key": "RAIL_1767264000000",
            "leg": "RAIL",
            "legLength": 33.3,
            "shortenLabels": false,
            "type": "TransitBar",
            "withBicycle": false,
            "withCar": false,
          },
        ],
        "iconLegsInPixels": 0,
        "showRentalBikeDurationWarning": true,
        "stopNames": [
          "station",
          "from 40",
        ],
        "vehicleNames": [
          "to-bicycle",
          "rail RAIL1",
        ],
      }
    `);
  });

  it('rented scooter', () => {
    expect(buildStrip([makeLeg('SCOOTER', 0, 10, { rentedBike: true }), makeLeg('RAIL', 10, 20)]))
      .toMatchInlineSnapshot(`
      {
        "bikeNetwork": undefined,
        "citybikeNetworkCount": 0,
        "citybikeicon": undefined,
        "elements": [
          {
            "duration": 10,
            "icon": undefined,
            "key": "SCOOTER_2026-01-01T10:00:00.000Z",
            "leg": "SCOOTER",
            "legLength": 33.3,
            "mode": "SCOOTER",
            "parkingIndicator": undefined,
            "renderModeIcons": true,
            "type": "ItineraryStreetLeg",
          },
          {
            "fitRouteNumber": true,
            "hasOneTransitLeg": true,
            "interliningWithRoute": undefined,
            "key": "RAIL_1767262200000",
            "leg": "RAIL",
            "legLength": 66.7,
            "shortenLabels": false,
            "type": "TransitBar",
            "withBicycle": false,
            "withCar": false,
          },
        ],
        "iconLegsInPixels": 0,
        "showRentalBikeDurationWarning": false,
        "stopNames": [
          "",
          "from 10",
        ],
        "vehicleNames": [
          "to-e-scooter",
          "rail RAIL1",
        ],
      }
    `);
  });
});
