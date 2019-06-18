import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as utils from '../../../app/util/legUtils';

describe('legUtils', () => {
  describe('getLegMode', () => {
    it('should return undefined for a null leg', () => {
      const leg = null;
      const mode = utils.getLegMode(leg);
      expect(mode).to.equal(undefined);
    });

    it('should return undefined for a null mode', () => {
      const leg = {
        mode: null,
      };
      const mode = utils.getLegMode(leg);
      expect(mode).to.equal(undefined);
    });

    it('should return undefined for an unknown mode', () => {
      const leg = {
        mode: 'invalid',
      };
      const mode = utils.getLegMode(leg);
      expect(mode).to.equal(undefined);
    });

    it('should be case-insensitive', () => {
      const leg = {
        mode: 'citybike',
      };
      const mode = utils.getLegMode(leg);
      expect(mode).to.equal(utils.LegMode.CityBike);
    });

    it('should return the mode for a string literal mode', () => {
      const literalMode = 'WALK';
      const mode = utils.getLegMode(literalMode);
      expect(mode).to.equal(utils.LegMode.Walk);
    });

    it('should return the mode for a string object mode', () => {
      // eslint-disable-next-line no-new-wrappers
      const objectMode = new String('WALK');
      const mode = utils.getLegMode(objectMode);
      expect(mode).to.equal(utils.LegMode.Walk);
    });
  });

  describe('getTotalWalkingDistance', () => {
    it('should return 0 if there are no legs available', () => {
      const itinerary = {
        legs: [],
      };
      const distance = utils.getTotalWalkingDistance(itinerary);
      expect(distance).to.equal(0);
    });

    it('should include only walking legs', () => {
      const itinerary = {
        legs: [
          {
            distance: 2,
            mode: utils.LegMode.Walk,
          },
          {
            distance: 3,
            mode: utils.LegMode.Bicycle,
          },
        ],
      };
      const distance = utils.getTotalWalkingDistance(itinerary);
      expect(distance).to.equal(2);
    });

    it('should include all walking legs', () => {
      const itinerary = {
        legs: [
          {
            distance: 2,
            mode: utils.LegMode.Walk,
          },
          {
            distance: 3,
            mode: utils.LegMode.Bicycle,
          },
          {
            distance: 1,
            mode: utils.LegMode.Walk,
          },
        ],
      };
      const distance = utils.getTotalWalkingDistance(itinerary);
      expect(distance).to.equal(3);
    });

    it('should include bicycle_walk legs', () => {
      const itinerary = {
        legs: [
          {
            distance: 1,
            mode: utils.LegMode.Walk,
          },
          {
            distance: 2,
            mode: utils.LegMode.BicycleWalk,
          },
        ],
      };
      const distance = utils.getTotalWalkingDistance(itinerary);
      expect(distance).to.equal(3);
    });
  });

  describe('getTotalBikingDistance', () => {
    it('should return 0 if there are no legs available', () => {
      const itinerary = {
        legs: [],
      };
      const distance = utils.getTotalBikingDistance(itinerary);
      expect(distance).to.equal(0);
    });

    it('should include bicycle legs', () => {
      const itinerary = {
        legs: [
          {
            distance: 1,
            mode: utils.LegMode.Bicycle,
          },
          {
            distance: 2,
            mode: utils.LegMode.Walk,
          },
        ],
      };
      const distance = utils.getTotalBikingDistance(itinerary);
      expect(distance).to.equal(1);
    });

    it('should include citybike legs', () => {
      const itinerary = {
        legs: [
          {
            distance: 1,
            mode: utils.LegMode.CityBike,
          },
          {
            distance: 2,
            mode: utils.LegMode.Walk,
          },
        ],
      };
      const distance = utils.getTotalBikingDistance(itinerary);
      expect(distance).to.equal(1);
    });
  });

  const originalLegs = [
    {
      __dataID__: 'client:34101763472',
      mode: 'BICYCLE',
      from: {
        __dataID__: 'client:34101763478',
        lat: 60.13439983320878,
        lon: 24.51058387756348,
        name: 'Jorvaksenkaari 13, Kirkkonummi',
        vertexType: 'NORMAL',
        bikeRentalStation: null,
        stop: null,
      },
      to: {
        __dataID__: 'client:34101763479',
        lat: 60.137609100000006,
        lon: 24.512710900000002,
        name: 'corner of path and parking aisle',
        vertexType: 'NORMAL',
        bikeRentalStation: null,
        stop: null,
      },
      legGeometry: {
        __dataID__: 'client:34101763477',
        length: 37,
        points:
          '__`nJgfrtCo@TKR?RBp@EBSVe@j@FRELCPCNINFTQXUVOVYHM@QBQ?UGUOUUS_@Oe@a@_Bk@iC{@mCSs@Ke@EYG[C_@SJKFy@yC',
      },
      intermediateStops: [],
      realTime: false,
      transitLeg: false,
      rentedBike: false,
      startTime: 1527759917000,
      endTime: 1527760041000,
      distance: 536.3270000000001,
      duration: 124,
      intermediatePlace: false,
      route: null,
      trip: null,
      __fragments__: { '8::client': [{}] },
    },
    {
      __dataID__: 'client:34101763473',
      mode: 'WALK',
      from: {
        __dataID__: 'client:34101763481',
        lat: 60.137609100000006,
        lon: 24.512710900000002,
        name: 'corner of path and parking aisle',
        vertexType: 'NORMAL',
        bikeRentalStation: null,
        stop: null,
      },
      to: {
        __dataID__: 'client:34101763482',
        lat: 60.13767,
        lon: 24.512328,
        name: 'Jorvas, Kirkkonummi',
        vertexType: 'NORMAL',
        bikeRentalStation: null,
        stop: null,
      },
      legGeometry: {
        __dataID__: 'client:34101763480',
        length: 5,
        points: '_s`nJmsrtCOLGHCBPj@',
      },
      intermediateStops: [],
      realTime: false,
      transitLeg: false,
      rentedBike: false,
      startTime: 1527760041000,
      endTime: 1527760089000,
      distance: 32.369,
      duration: 48,
      intermediatePlace: false,
      route: null,
      trip: null,
      __fragments__: { '8::client': [{}] },
    },
    {
      __dataID__: 'client:34101763474',
      mode: 'WALK',
      from: {
        __dataID__: 'client:34101763484',
        lat: 60.13767,
        lon: 24.512328,
        name: 'Jorvas, Kirkkonummi',
        vertexType: 'NORMAL',
        bikeRentalStation: null,
        stop: null,
      },
      to: {
        __dataID__: 'client:34101763485',
        lat: 60.137802,
        lon: 24.512489000000002,
        name: 'corner of Platform 1 and service road',
        vertexType: 'NORMAL',
        bikeRentalStation: null,
        stop: null,
      },
      legGeometry: {
        __dataID__: 'client:34101763483',
        length: 6,
        points: 'is`nJeqrtCQk@??GJA@AB',
      },
      intermediateStops: [],
      realTime: false,
      transitLeg: false,
      rentedBike: false,
      startTime: 1527760089000,
      endTime: 1527760121000,
      distance: 23.669999999999998,
      duration: 32,
      intermediatePlace: true,
      route: null,
      trip: null,
      __fragments__: { '8::client': [{}] },
    },
    {
      __dataID__: 'client:34101763475',
      mode: 'BICYCLE',
      from: {
        __dataID__: 'client:34101763487',
        lat: 60.137802,
        lon: 24.512489000000002,
        name: 'corner of Platform 1 and service road',
        vertexType: 'NORMAL',
        bikeRentalStation: null,
        stop: null,
      },
      to: {
        __dataID__: 'client:34101763488',
        lat: 60.136967,
        lon: 24.505533,
        name: 'Elfvinginkuja 7, Kirkkonummi',
        vertexType: 'NORMAL',
        bikeRentalStation: null,
        stop: null,
      },
      legGeometry: {
        __dataID__: 'client:34101763486',
        length: 24,
        points:
          'gt`nJ_rrtCCl@h@hBlB|F@L?L?LC`@s@vFKp@HZFRdAdDL`@HNHHOh@AF@XLfATzBCZGh@I`@',
      },
      intermediateStops: [],
      realTime: false,
      transitLeg: false,
      rentedBike: false,
      startTime: 1527760121000,
      endTime: 1527760228000,
      distance: 471.849,
      duration: 107,
      intermediatePlace: false,
      route: null,
      trip: null,
      __fragments__: { '8::client': [{}] },
    },
    {
      __dataID__: 'client:34101763476',
      mode: 'BICYCLE',
      from: {
        __dataID__: 'client:34101763490',
        lat: 60.136967,
        lon: 24.505533,
        name: 'Elfvinginkuja 7, Kirkkonummi',
        vertexType: 'NORMAL',
        bikeRentalStation: null,
        stop: null,
      },
      to: {
        __dataID__: 'client:34101763491',
        lat: 60.13998772676328,
        lon: 24.51303005218506,
        name: 'Kolmenkylänkuja 3, Kirkkonummi',
        vertexType: 'NORMAL',
        bikeRentalStation: null,
        stop: null,
      },
      legGeometry: {
        __dataID__: 'client:34101763489',
        length: 24,
        points:
          '}m`nJieqtCHa@Fi@B[U{BMgAAY@GS_@e@oAEOg@mBQs@wC}Hi@eB{@kCgAcCGO]w@GFe@b@_@\\e@{CWaA',
      },
      intermediateStops: [],
      realTime: false,
      transitLeg: false,
      rentedBike: false,
      startTime: 1527760228000,
      endTime: 1527760367000,
      distance: 617.027,
      duration: 139,
      intermediatePlace: true,
      route: null,
      trip: null,
      __fragments__: { '8::client': [{}] },
    },
  ];

  describe('compressLegs', () => {
    it('should apply the "BICYCLE_WALK" mode to compressed legs', () => {
      const compressedLegs = utils.compressLegs(originalLegs);

      expect(
        compressedLegs.filter(leg => leg.to.name === 'Jorvas, Kirkkonummi')[0]
          .mode,
      ).to.equal('BICYCLE_WALK');
      expect(
        compressedLegs.filter(leg => leg.from.name === 'Jorvas, Kirkkonummi')[0]
          .mode,
      ).to.equal('BICYCLE_WALK');
    });

    it('should not compress intermediate legs', () => {
      const compressedLegs = utils.compressLegs(originalLegs);

      expect(
        compressedLegs.filter(leg => leg.from.name === 'Jorvas, Kirkkonummi')[0]
          .intermediatePlace,
      ).to.equal(true);
      expect(
        compressedLegs.filter(
          leg => leg.from.name === 'Elfvinginkuja 7, Kirkkonummi',
        )[0].intermediatePlace,
      ).to.equal(true);
      expect(
        compressedLegs.filter(leg => leg.intermediatePlace).length,
      ).to.equal(2);
      expect(compressedLegs.length).to.equal(5);
    });
  });

  describe('getTotalDistance', () => {
    it('should calculate the total distance of all legs', () => {
      const itinerary = {
        legs: [{ distance: 1 }, { distance: 3 }, { distance: 5 }],
      };
      expect(utils.getTotalDistance(itinerary)).to.equal(9);
    });

    it('should ignore a missing distance value', () => {
      const itinerary = {
        legs: [{ distance: 1 }, { distance: undefined }, { distance: 5 }],
      };
      expect(utils.getTotalDistance(itinerary)).to.equal(6);
    });
  });

  describe('getZones', () => {
    it('should return an empty array if there are no legs', () => {
      expect(utils.getZones({})).to.deep.equal([]);
      expect(utils.getZones(undefined)).to.deep.equal([]);
      expect(utils.getZones(null)).to.deep.equal([]);
      expect(utils.getZones([])).to.deep.equal([]);
    });

    it('should ignore a missing "from" field', () => {
      const legs = [
        {
          to: {
            stop: {
              zoneId: 'A',
            },
          },
        },
      ];
      expect(utils.getZones(legs)).to.deep.equal(['A']);
    });

    it('should ignore a missing "to" field', () => {
      const legs = [
        {
          from: {
            stop: {
              zoneId: 'A',
            },
          },
        },
      ];
      expect(utils.getZones(legs)).to.deep.equal(['A']);
    });

    it('should retrieve the zone from "from"', () => {
      const legs = [
        {
          from: {
            stop: {
              zoneId: 'A',
            },
          },
          to: {
            stop: {
              zoneId: null,
            },
          },
        },
      ];
      expect(utils.getZones(legs)).to.deep.equal(['A']);
    });

    it('should retrieve the zone from "to"', () => {
      const legs = [
        {
          from: {
            stop: {
              zoneId: null,
            },
          },
          to: {
            stop: {
              zoneId: 'A',
            },
          },
        },
      ];
      expect(utils.getZones(legs)).to.deep.equal(['A']);
    });

    it('should retrieve the zone from "intermediatePlaces"', () => {
      const legs = [
        {
          intermediatePlaces: [
            {
              stop: null,
            },
            {
              stop: {
                zoneId: null,
              },
            },
            {
              stop: {
                zoneId: 'A',
              },
            },
          ],
        },
      ];
      expect(utils.getZones(legs)).to.deep.equal(['A']);
    });

    it('should add zone "B" if zones "A" and "C" already exist', () => {
      const legs = [
        {
          from: {
            stop: {
              zoneId: 'A',
            },
          },
        },
        {
          to: {
            stop: {
              zoneId: 'C',
            },
          },
        },
      ];
      expect(utils.getZones(legs)).to.deep.equal(['A', 'B', 'C']);
    });

    it('should return unique values in alphabetical order', () => {
      const legs = [
        {
          from: null,
          intermediatePlaces: [
            {
              stop: {
                zoneId: 'B',
              },
            },
            {
              stop: {
                zoneId: 'A',
              },
            },
          ],
          to: {
            stop: {
              zoneId: 'A',
            },
          },
        },
        {
          from: {
            stop: {
              zoneId: 'A',
            },
          },
          to: {
            stop: {
              zoneId: 'B',
            },
          },
        },
        {
          from: {
            stop: {
              zoneId: 'C',
            },
          },
          to: {
            stop: {
              zoneId: 'B',
            },
          },
        },
      ];
      expect(utils.getZones(legs)).to.deep.equal(['A', 'B', 'C']);
    });
  });
});
