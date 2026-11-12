import { getItineraryStreetLegData } from '../../../../app/component/itinerary/itineraryStreetLegUtils';

const getStreetLeg = (legOverrides = {}, options = {}) => {
  const leg = {
    mode: 'WALK',
    duration: 179,
    start: { scheduledTime: '2026-11-06T10:00:00Z' },
    from: { name: 'Rental station' },
    to: {},
    ...legOverrides,
  };
  return getItineraryStreetLegData({
    leg,
    index: 1,
    startMs: 123,
    legLength: 25,
    renderBar: true,
    renderModeIcons: true,
    usingOwnBicycle: false,
    bikeParkedIndex: 2,
    config: { flex: { taxiExternalIcon: 'icon_taxi' } },
    ...options,
  });
};

describe('getItineraryStreetLegData', () => {
  it.each([
    ['WALK', false, 'walk'],
    ['BICYCLE_WALK', false, 'walk'],
    ['BICYCLE', false, 'BICYCLE'],
    ['BICYCLE', true, 'CITYBIKE'],
    ['CITYBIKE', true, 'CITYBIKE'],
    ['SCOOTER', true, 'SCOOTER'],
    ['CAR', false, 'CAR'],
    ['TAXI', false, 'taxi-external'],
  ])(
    'preserves common data for %s (rented: %s)',
    (mode, rentedBike, expectedMode) => {
      const data = getStreetLeg({ mode, rentedBike });

      expect(data).toMatchObject({
        mode: expectedMode,
        leg: { mode, rentedBike },
        duration: 2,
        legLength: 25,
        key:
          mode === 'SCOOTER' ? 'SCOOTER_2026-11-06T10:00:00Z' : `${mode}_123`,
      });
      expect(data.renderModeIcons).toBe(mode === 'CAR' ? undefined : true);
    },
  );

  it.each(['WALK', 'BICYCLE_WALK', 'BICYCLE'])(
    'omits %s when its bar is hidden',
    mode => {
      expect(getStreetLeg({ mode }, { renderBar: false })).toBeNull();
    },
  );

  it.each(['CAR', 'TAXI', 'CITYBIKE', 'SCOOTER'])(
    'keeps %s even when renderBar is false',
    mode => {
      expect(
        getStreetLeg({ mode, rentedBike: true }, { renderBar: false }),
      ).not.toBeNull();
    },
  );

  it.each(['BUS', 'CITYBIKE', 'SCOOTER'])(
    'omits unsupported or non-rented %s legs',
    mode => {
      expect(getStreetLeg({ mode, rentedBike: false })).toBeNull();
    },
  );

  it('uses bicycle-walk only before the bicycle is parked', () => {
    expect(getStreetLeg({}, { usingOwnBicycle: true }).mode).toBe(
      'bicycle_walk',
    );
    expect(getStreetLeg({}, { usingOwnBicycle: true, index: 2 }).mode).toBe(
      'walk',
    );
  });

  it.each([
    ['WALK', true, 'bike'],
    ['WALK', false, undefined],
    ['BICYCLE', false, 'bike'],
    ['CAR', false, 'car'],
  ])(
    'preserves parking for %s (own bicycle: %s)',
    (mode, usingOwnBicycle, parkingIndicator) => {
      expect(
        getStreetLeg({ mode, to: { vehicleParking: {} } }, { usingOwnBicycle })
          .parkingIndicator,
      ).toBe(parkingIndicator);
      expect(
        getStreetLeg({ mode }, { usingOwnBicycle }).parkingIndicator,
      ).toBeUndefined();
    },
  );

  it('preserves mode-specific icons and accessibility data', () => {
    expect(getStreetLeg({ mode: 'CAR' }).icon).toBe('icon_car');
    expect(getStreetLeg({ mode: 'TAXI' }).icon).toBe('icon_taxi');
    expect(getStreetLeg({ mode: 'BICYCLE', rentedBike: true })).toMatchObject({
      vehicleNameId: 'to-bicycle',
      stopName: 'Rental station',
    });
    expect(getStreetLeg({ mode: 'SCOOTER', rentedBike: true })).toMatchObject({
      vehicleNameId: 'to-e-scooter',
      stopName: '',
    });
  });
});
