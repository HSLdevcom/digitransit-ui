import { expect } from 'chai';
import { describe, it } from 'mocha';
import { mockContext } from './helpers/mock-context';
import defaultConfig from '../../app/configurations/config.default';
import * as utils from '../../app/util/promotionUtils';

function mockFunction(value) {
  return value;
}
const context = mockContext;
const config = defaultConfig;
const currentTime = 1473676196;
const setPromotionSuggestions = mockFunction();

const modifiedContext = {
  ...context,
  router: {
    params: {
      from: 'Opastinsilta 6, Helsinki::60.1991884,24.940689499999998',
      to: 'Kamppi 1241, Helsinki::60.169119,24.932058',
    },
  },
  location: {
    search:
      '?accessibilityOption=0&bikeSpeed=5&minTransferTime=120&modes=BUS%2CTRAM%2CRAIL%2CSUBWAY%2CFERRY%2CPUBLIC_TRANSPORT&optimize=QUICK&ticketTypes&transferPenalty=5460&walkBoardCost=600&walkReluctance=3&walkSpeed=1.2',
    query: {
      accessibilityOption: 0,
      bikeSpeed: 5,
      minTransferTime: 120,
      modes: 'BUS,TRAM,RAIL,SUBWAY,FERRY,PUBLIC_TRANSPORT',
      optimize: 'QUICK',
      ticketTypes: null,
      transferPenalty: 5460,
      walkBoardCost: 600,
      walkReluctance: 3,
      walkSpeed: 1.2,
    },
  },
};

describe('promotionUtils', () => {
  describe('checkPromotionQueries', () => {
    it('should return undefined if itineraries are empty', () => {
      const emptyItineraries = [];
      const result = utils.checkPromotionQueries(
        emptyItineraries,
        context,
        config,
        currentTime,
        setPromotionSuggestions,
      );
      expect(result).to.equal(undefined);
    });
  });

  describe('checkResults', () => {
    it('should let the plan pass if it qualifies for a promotion', () => {
      const plan = {
        duration: 424,
        endTime: 1536583984000,
        legs: [
          {
            distance: 1236.399,
            endTime: 1536583984000,
            from: null,
            mode: 'BICYCLE',
            startTime: 1536583667000,
            to: null,
          },
        ],
        startTime: 1536583560000,
        walkTime: 424,
      };
      const result = utils.checkResults(plan, 1800, 5000);
      expect(result).to.equal(plan);
    });
  });

  describe('defaultParams', () => {
    it('should return query params for the set time with the current location`s options', () => {
      const result = utils.defaultParams(currentTime, config, modifiedContext);
      const expectedResult = {
        wheelchair: false,
        ignoreRealtimeUpdates: null,
        maxPreTransitTime: null,
        walkOnStreetReluctance: null,
        waitReluctance: null,
        bikeSpeed: 5,
        bikeSwitchTime: null,
        bikeSwitchCost: null,
        bikeBoardCost: null,
        optimize: 'QUICK',
        triangle: null,
        carParkCarLegWeight: null,
        maxTransfers: null,
        waitAtBeginningFactor: null,
        heuristicStepsPerMainStep: null,
        compactLegsByReversedSearch: null,
        disableRemainingWeightHeuristic: false,
        modeWeight: null,
        accessibilityOption: 0,
        minTransferTime: 120,
        preferredRoutes: [],
        ticketTypes: null,
        transferPenalty: 5460,
        unpreferredRoutes: [],
        walkBoardCost: 600,
        walkReluctance: 3,
        walkSpeed: 1.2,
        modes: 'BUS,FERRY,RAIL,SUBWAY,TRAM',
        fromPlace: 'Opastinsilta 6, Helsinki::60.1991884,24.940689499999998',
        toPlace: 'Kamppi 1241, Helsinki::60.169119,24.932058',
        from: {
          address: 'Opastinsilta 6, Helsinki',
          lat: 60.1991884,
          lon: 24.940689499999998,
        },
        to: {
          address: 'Kamppi 1241, Helsinki',
          lat: 60.169119,
          lon: 24.932058,
        },
        intermediatePlaces: [],
        maxWalkDistance: 10000,
        itineraryFiltering: 1.5,
        preferred: { routes: undefined },
        unpreferred: { routes: undefined },
        numItineraries: 1,
        arriveBy: false,
        date: '1970-01-18',
        time: '03:21',
      };
      expect({ ...result }).to.deep.equal({ ...expectedResult });
    });
  });
  describe('getPromotionQuery', () => {
    it('should return a Relay query for the set promotion mode', () => {
      const result = utils.getPromotionQuery(
        currentTime,
        config,
        modifiedContext,
        'WALK',
      );
      expect(result[Object.keys(result)[1]].variables.modes).to.equal('WALK');
    });
  });
});
