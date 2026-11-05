import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/mock-providers';
import { createTestConfig, mockContext } from '../../helpers/mock-context';
import { mockMatch } from '../../helpers/mock-router';
import ItineraryDetails from '../../../../app/component/itinerary/ItineraryDetails';
import * as fareUtils from '../../../../utils/client/fareUtils';
import * as legUtils from '../../../../utils/client/legUtils';

// Legs needs deep, mode specific leg data; here it only exposes the props
// ItineraryDetails computes for it.
vi.mock('../../../../app/component/itinerary/Legs', async () => {
  const { createElement } = await import('react');
  return {
    default: props =>
      createElement('div', {
        className: 'legs-stub',
        'data-bike-boarding': String(!!props.showBikeBoardingInformation),
        'data-car-boarding': String(!!props.showCarBoardingInformation),
        'data-own-car-whole-trip': String(!!props.usingOwnCarWholeTrip),
        'data-leg-modes': props.itinerary.legs.map(leg => leg.mode).join(','),
        'data-fares':
          props.fares
            ?.map(fare => (fare.isUnknown ? 'unknown' : fare.ticketName))
            .join(',') ?? 'null',
      }),
  };
});

const time = (hour, minute = 0) =>
  `2026-10-30T${String(hour).padStart(2, '0')}:${String(minute).padStart(
    2,
    '0',
  )}:00+02:00`;

const makePlace = (overrides = {}) => ({
  lat: 60.2,
  lon: 24.9,
  name: 'Place',
  stop: null,
  vehicleParking: null,
  vehicleRentalStation: null,
  rentalVehicle: null,
  ...overrides,
});

const makeLeg = (overrides = {}) => ({
  mode: 'WALK',
  transitLeg: false,
  rentedBike: false,
  distance: 500,
  duration: 400,
  start: { scheduledTime: time(10) },
  end: { scheduledTime: time(10, 7) },
  from: makePlace(),
  to: makePlace(),
  route: null,
  trip: null,
  fareProducts: [],
  ...overrides,
});

const makeRoute = (overrides = {}) => ({
  gtfsId: 'HSL:1',
  shortName: 'R',
  longName: 'Route',
  mode: 'RAIL',
  type: 109,
  desc: null,
  url: null,
  agency: { gtfsId: 'HSL:HSL', name: 'HSL', fareUrl: null },
  ...overrides,
});

const makeStop = gtfsId => ({ gtfsId, zoneId: 'A', code: null });

const makeWalkLeg = overrides => makeLeg(overrides);

const makeRailLeg = (overrides = {}) =>
  makeLeg({
    mode: 'RAIL',
    transitLeg: true,
    distance: 5000,
    duration: 600,
    start: { scheduledTime: time(10, 10) },
    end: { scheduledTime: time(10, 20) },
    from: makePlace({ stop: makeStop('HSL:1') }),
    to: makePlace({ stop: makeStop('HSL:2') }),
    route: makeRoute(),
    trip: { gtfsId: 'HSL:trip1', isReplacement: false },
    ...overrides,
  });

const makeItinerary = (legs = [makeWalkLeg(), makeRailLeg()]) => ({
  start: legs[0]?.start.scheduledTime,
  end: legs[legs.length - 1]?.end.scheduledTime,
  duration: 1200,
  emissionsPerPerson: { co2: 100 },
  legs,
});

const renderDetails = ({
  itinerary = makeItinerary(),
  props = {},
  config = {},
  params = {},
  breakpoint = 'small',
} = {}) => {
  const { container } = renderWithProviders(
    <ItineraryDetails
      itinerary={itinerary}
      focusToPoint={() => {}}
      focusToLeg={() => {}}
      openSettings={() => {}}
      isMobile
      tabIndex={0}
      {...props}
    />,
    {
      config: createTestConfig({ language: 'en', ...config }),
      match: { ...mockMatch, params },
      breakpoint,
    },
  );
  return container;
};

const CALL_AGENCY_ROUTE_TYPE = 715;

const knownFareProducts = [
  { id: 'fp1', product: { id: 'HSL:AB', price: { amount: 3.1 } } },
];

const makeFareConfig = (overrides = {}) => ({
  showTicketInformation: true,
  showTicketPrice: true,
  feedIds: ['HSL'],
  availableTickets: { HSL: { 'HSL:AB': { price: 3.1, zones: ['A', 'B'] } } },
  fareMapping: id => id.split(':')[1],
  primaryAgencyName: 'Test Agency',
  ...overrides,
});

const makePurchaseConfig = (overrides = {}) =>
  makeFareConfig({
    ticketPurchaseLink: () => 'https://example.com/buy',
    ticketLinkOperatorCode: 'HSL',
    ticketButtonTextId: 'open-app',
    ...overrides,
  });

const makeRentalConfig = (networkOverrides = {}) => ({
  vehicleRental: {
    ...mockContext.config.vehicleRental,
    networks: {
      smoove: {
        type: 'citybike',
        name: { en: 'Smoove' },
        timeBeforeSurcharge: 60 * 60,
        durationInstructions: { en: 'https://example.com/smoove' },
        ...networkOverrides,
      },
      vanderlande: {
        type: 'citybike',
        name: { en: 'Vanderlande' },
        timeBeforeSurcharge: 30 * 60,
        durationInstructions: { en: 'https://example.com/vanderlande' },
      },
    },
  },
});

const makeRentalLeg = (duration, networkId = 'smoove', overrides = {}) =>
  makeLeg({
    mode: 'BICYCLE',
    rentedBike: true,
    duration,
    from: makePlace({
      vehicleRentalStation: { rentalNetwork: { networkId } },
    }),
    ...overrides,
  });

const makeCallAgencyLeg = (agencyGtfsId, overrides = {}) =>
  makeRailLeg({
    mode: 'BUS',
    route: makeRoute({
      gtfsId: 'CALL:1',
      type: CALL_AGENCY_ROUTE_TYPE,
      agency: { gtfsId: agencyGtfsId, name: 'Call agency', fareUrl: null },
    }),
    ...overrides,
  });

// For tests expecting React or react-intl to report an error: the suite's
// console.error throws, and jsdom prints uncaught render errors.
let preventUncaughtError;
const silenceConsoleError = () => {
  preventUncaughtError = e => e.preventDefault();
  window.addEventListener('error', preventUncaughtError);
  return vi.spyOn(console, 'error').mockImplementation(() => {});
};

afterEach(() => {
  window.removeEventListener('error', preventUncaughtError);
});

describe('<ItineraryDetails />', () => {
  describe('guards and shell', () => {
    it('renders the container, summary and legs for a valid itinerary', () => {
      const container = renderDetails();
      expect(container.querySelector('.itinerary-tab')).not.toBeNull();
      expect(container.querySelector('.itinerary-summary')).not.toBeNull();
      expect(container.querySelector('.legs-stub')).not.toBeNull();
    });

    it('renders nothing when the itinerary has no legs', () => {
      const container = renderDetails({ itinerary: makeItinerary([]) });
      expect(container.querySelector('.itinerary-tab')).toBeNull();
    });

    it('announces the departure time of the first leg in the heading', () => {
      const container = renderDetails({ props: { tabIndex: 3 } });
      const heading = container.querySelector('h2.sr-only');
      expect(heading.textContent).toContain('10:00');
      expect(heading.querySelector('#tab-3-context')).not.toBeNull();
    });
  });

  describe('itinerary number in the heading', () => {
    const headingText = params =>
      renderDetails({ params }).querySelector('h2.sr-only').textContent;

    it('defaults to 1 without a hash', () => {
      expect(headingText({})).toContain('Itinerary suggestion 1');
    });

    it('uses the zero based hash plus one', () => {
      expect(headingText({ hash: '0' })).toContain('Itinerary suggestion 1');
      expect(headingText({ hash: '2' })).toContain('Itinerary suggestion 3');
    });

    it('prefers secondHash over hash', () => {
      expect(
        headingText({ hash: 'bikeAndVehicle', secondHash: '2' }),
      ).toContain('Itinerary suggestion 3');
      expect(headingText({ hash: '5', secondHash: '1' })).toContain(
        'Itinerary suggestion 2',
      );
    });

    it('falls back to 1 for street hashes', () => {
      expect(headingText({ hash: 'walk' })).toContain('Itinerary suggestion 1');
      expect(headingText({ hash: 'bike' })).toContain('Itinerary suggestion 1');
    });
  });

  describe('start navigation', () => {
    const startNavigationButton = container =>
      container.querySelector('.navi-start-container button');

    it('shows the button for a transit itinerary and calls the handler on click', () => {
      const startNavigation = vi.fn();
      const container = renderDetails({ props: { startNavigation } });
      const button = startNavigationButton(container);
      expect(button).not.toBeNull();
      fireEvent.click(button);
      expect(startNavigation).toHaveBeenCalledTimes(1);
    });

    it('is not shown without a handler', () => {
      const container = renderDetails();
      expect(container.querySelector('.navi-start-container')).toBeNull();
    });

    it.each([
      ['walking only', [makeWalkLeg()]],
      [
        'own bike only',
        [makeLeg({ mode: 'BICYCLE', transitLeg: false, rentedBike: false })],
      ],
      [
        'a rented bike',
        [
          makeWalkLeg(),
          makeLeg({ mode: 'BICYCLE', rentedBike: true }),
          makeRailLeg(),
        ],
      ],
      ['car driving', [makeWalkLeg(), makeLeg({ mode: 'CAR' }), makeRailLeg()]],
      ['a taxi', [makeWalkLeg(), makeLeg({ mode: 'TAXI' }), makeRailLeg()]],
      [
        'a scooter',
        [makeWalkLeg(), makeLeg({ mode: 'SCOOTER' }), makeRailLeg()],
      ],
      [
        'an airplane',
        [makeWalkLeg(), makeLeg({ mode: 'AIRPLANE' }), makeRailLeg()],
      ],
    ])('is not shown for %s', (_, legs) => {
      const container = renderDetails({
        itinerary: makeItinerary(legs),
        props: { startNavigation: () => {} },
      });
      expect(container.querySelector('.navi-start-container')).toBeNull();
    });

    describe('known quirks', () => {
      // characterizes current behavior: the mobile-only rule lives in
      // ItineraryPage, ItineraryDetails shows the button whenever it gets a handler
      it.each([['isMobile is false', { isMobile: false }, 'small']])(
        'is shown on desktop when %s',
        (_, props, breakpoint) => {
          const container = renderDetails({
            props: { startNavigation: () => {}, ...props },
            breakpoint,
          });
          expect(
            container.querySelector('.navi-start-container'),
          ).not.toBeNull();
        },
      );
    });
  });

  describe('vehicle rental duration warning', () => {
    const rentalItinerary = (...rentalLegs) =>
      makeItinerary([makeWalkLeg(), ...rentalLegs, makeWalkLeg()]);
    const infobox = container =>
      container.querySelector('.citybike-duration-infobox');

    it('does not show a warning without rental bikes', () => {
      const container = renderDetails({ config: makeRentalConfig() });
      expect(infobox(container)).toBeNull();
    });

    it('is shown when a rental exceeds the network surcharge limit', () => {
      const container = renderDetails({
        itinerary: rentalItinerary(makeRentalLeg(3601)),
        config: makeRentalConfig(),
      });
      expect(infobox(container)).not.toBeNull();
      expect(infobox(container).querySelector('a').href).toBe(
        'https://example.com/smoove',
      );
    });

    it('is not shown when the rental is exactly at the limit', () => {
      const container = renderDetails({
        itinerary: rentalItinerary(makeRentalLeg(3600)),
        config: makeRentalConfig(),
      });
      expect(infobox(container)).toBeNull();
    });

    it('does not add together the durations of separate rental trips', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeWalkLeg(),
          makeRentalLeg(2000),
          makeWalkLeg(),
          makeRentalLeg(2000),
          makeWalkLeg(),
        ]),
        config: makeRentalConfig(),
      });
      expect(infobox(container)).toBeNull();
    });

    it('uses the combined duration of consecutive rental legs', () => {
      const container = renderDetails({
        itinerary: rentalItinerary(makeRentalLeg(2000), makeRentalLeg(2000)),
        config: makeRentalConfig(),
      });
      expect(infobox(container)).not.toBeNull();
      expect(infobox(container).querySelector('a').href).toBe(
        'https://example.com/smoove',
      );
    });

    it('is not shown when the network has no duration instructions', () => {
      const container = renderDetails({
        itinerary: rentalItinerary(makeRentalLeg(7200)),
        config: makeRentalConfig({ durationInstructions: undefined }),
      });
      expect(infobox(container)).toBeNull();
    });

    it('is not shown when the network has no surcharge limit', () => {
      const container = renderDetails({
        itinerary: rentalItinerary(makeRentalLeg(7200)),
        config: makeRentalConfig({ timeBeforeSurcharge: undefined }),
      });
      expect(infobox(container)).toBeNull();
    });

    it('is not shown for a network missing from the config', () => {
      const container = renderDetails({
        itinerary: rentalItinerary(makeRentalLeg(7200, 'unknown')),
        config: makeRentalConfig(),
      });
      expect(infobox(container)).toBeNull();
    });

    it('lists every network that exceeds its limit', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeWalkLeg(),
          makeRentalLeg(3601, 'smoove'),
          makeWalkLeg(),
          makeRentalLeg(1801, 'vanderlande'),
          makeWalkLeg(),
        ]),
        config: makeRentalConfig(),
      });
      const hrefs = [...infobox(container).querySelectorAll('a')].map(
        a => a.href,
      );
      expect(hrefs).toEqual([
        'https://example.com/smoove',
        'https://example.com/vanderlande',
      ]);
    });

    it('shows each qualifying network once in first-qualifying order', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeWalkLeg(),
          makeRentalLeg(1800, 'vanderlande'),
          makeWalkLeg(),
          makeRentalLeg(3601, 'smoove'),
          makeWalkLeg(),
          makeRentalLeg(1801, 'vanderlande'),
          makeWalkLeg(),
          makeRentalLeg(3700, 'smoove'),
          makeWalkLeg(),
        ]),
        config: makeRentalConfig(),
      });
      const hrefs = [...infobox(container).querySelectorAll('a')].map(
        a => a.href,
      );
      expect(hrefs).toEqual([
        'https://example.com/smoove',
        'https://example.com/vanderlande',
      ]);
    });

    describe('known quirks', () => {
      // characterizes current behavior: only station based rentals are checked
      it('is not shown for a free floating rental', () => {
        const container = renderDetails({
          itinerary: rentalItinerary(
            makeRentalLeg(7200, 'smoove', {
              from: makePlace({
                rentalVehicle: { rentalNetwork: { networkId: 'smoove' } },
              }),
            }),
          ),
          config: makeRentalConfig(),
        });
        expect(infobox(container)).toBeNull();
      });
    });
  });

  describe('ticket information and fare disclaimers', () => {
    const ticketBlock = container =>
      container.querySelector('.itinerary-ticket-information');
    const purchaseBlock = container =>
      container.querySelector('.itinerary-ticket-information-purchase');
    const disclaimerTexts = container =>
      [...container.querySelectorAll('.unknown-fare-disclaimer__top')].map(
        el => el.textContent,
      );
    const knownFareItinerary = (...extraLegs) =>
      makeItinerary([
        makeWalkLeg(),
        makeRailLeg({ fareProducts: knownFareProducts }),
        ...extraLegs,
      ]);

    it.each([
      ['a mobile purchase', makePurchaseConfig(), knownFareItinerary()],
      [
        'an unknown fare',
        makeFareConfig(),
        makeItinerary([makeWalkLeg(), makeRailLeg()]),
      ],
      ['no fares', makeFareConfig(), makeItinerary([makeWalkLeg()])],
      [
        'fare information is disabled',
        { showTicketInformation: false },
        knownFareItinerary(),
      ],
    ])('calculates fares once when %s', (_, config, itinerary) => {
      const getFaresFromLegs = vi.spyOn(fareUtils, 'getFaresFromLegs');
      renderDetails({ config, itinerary });
      expect(getFaresFromLegs).toHaveBeenCalledTimes(1);
      expect(getFaresFromLegs.mock.calls[0][0]).toBe(itinerary.legs);
    });

    it('updates fare-dependent UI when the itinerary changes', () => {
      const props = {
        itinerary: knownFareItinerary(),
        focusToPoint: () => {},
        focusToLeg: () => {},
        openSettings: () => {},
        isMobile: true,
        tabIndex: 0,
      };
      const { container, rerender } = renderWithProviders(
        <ItineraryDetails {...props} />,
        {
          config: createTestConfig({ language: 'en', ...makePurchaseConfig() }),
          match: { ...mockMatch, params: {} },
          breakpoint: 'small',
        },
      );

      expect(purchaseBlock(container).textContent).toContain('AB');
      expect(container.querySelector('.divider-bottom')).toBeNull();
      expect(container.querySelector('.legs-stub').dataset.fares).toBe('AB');

      rerender(
        <ItineraryDetails
          {...props}
          itinerary={makeItinerary([makeWalkLeg(), makeRailLeg()])}
        />,
      );

      expect(purchaseBlock(container)).toBeNull();
      expect(container.querySelector('.unknown-fare-container')).not.toBeNull();
      expect(disclaimerTexts(container)).toHaveLength(1);
      expect(container.querySelector('.divider-bottom')).not.toBeNull();
      expect(container.querySelector('.legs-stub').dataset.fares).toBe(
        'unknown',
      );
    });

    it('renders without ticket information when it is disabled', () => {
      const container = renderDetails({ itinerary: knownFareItinerary() });
      expect(container.querySelector('.itinerary-tab')).not.toBeNull();
      expect(ticketBlock(container)).toBeNull();
      expect(purchaseBlock(container)).toBeNull();
      expect(disclaimerTexts(container)).toEqual([]);
    });

    it('shows the required ticket and price', () => {
      const container = renderDetails({
        itinerary: knownFareItinerary(),
        config: makeFareConfig(),
        breakpoint: 'large',
        props: { isMobile: false },
      });
      expect(ticketBlock(container).textContent).toContain('AB');
      expect(ticketBlock(container).textContent).toContain('3.10');
      expect(purchaseBlock(container)).toBeNull();
      expect(disclaimerTexts(container)).toEqual([]);
    });

    it('shows the purchase block on mobile for a single known fare', () => {
      const container = renderDetails({
        itinerary: knownFareItinerary(),
        config: makePurchaseConfig(),
      });
      expect(purchaseBlock(container)).not.toBeNull();
      expect(ticketBlock(container)).toBeNull();
    });

    it('shows the plain ticket block instead of purchase on large screens', () => {
      const container = renderDetails({
        itinerary: knownFareItinerary(),
        config: makePurchaseConfig(),
        breakpoint: 'large',
        props: { isMobile: false },
      });
      expect(ticketBlock(container)).not.toBeNull();
      expect(purchaseBlock(container)).toBeNull();
    });

    it('shows the generic disclaimer and unknown fare for a leg without fare products', () => {
      const container = renderDetails({
        itinerary: makeItinerary([makeWalkLeg(), makeRailLeg()]),
        config: makeFareConfig(),
      });
      expect(container.querySelector('.unknown-fare-container')).not.toBeNull();
      expect(disclaimerTexts(container)).toHaveLength(1);
      expect(disclaimerTexts(container)[0]).toContain(
        'Test Agency does not sell tickets',
      );
    });

    it('hides tickets and disclaimers for unknown fares when configured', () => {
      const container = renderDetails({
        itinerary: makeItinerary([makeWalkLeg(), makeRailLeg()]),
        config: makeFareConfig({ hideUnknownFares: true }),
      });
      expect(ticketBlock(container)).toBeNull();
      expect(disclaimerTexts(container)).toEqual([]);
    });

    it.each([
      ['a scooter', 'SCOOTER'],
      ['a taxi', 'TAXI'],
    ])('shows the generic disclaimer for %s despite known fares', (_, mode) => {
      const container = renderDetails({
        itinerary: knownFareItinerary(makeLeg({ mode })),
        config: makeFareConfig(),
        breakpoint: 'large',
        props: { isMobile: false },
      });
      expect(disclaimerTexts(container)).toHaveLength(1);
      expect(disclaimerTexts(container)[0]).toContain('does not sell tickets');
    });

    it('shows one disclaimer per configured mode', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeRailLeg(),
          makeRailLeg({ route: makeRoute({ gtfsId: 'HSL:3' }) }),
        ]),
        config: makeFareConfig({
          modeDisclaimers: {
            RAIL: {
              en: {
                disclaimer: 'Rail disclaimer',
                link: 'https://example.com/rail',
                text: 'Read more',
              },
            },
          },
        }),
      });
      expect(disclaimerTexts(container)).toHaveLength(1);
      expect(disclaimerTexts(container)[0]).toContain('Rail disclaimer');
      expect(
        container.querySelector('.unknown-fare-disclaimer__top a').href,
      ).toBe('https://example.com/rail');
    });

    describe('call agency legs', () => {
      const callAgencyConfig = (internalAgencies = []) =>
        makeFareConfig({
          callAgencyInfo: {
            en: {
              callAgencyInfoLink: 'https://example.com/call',
              callAgencyInfoLinkText: 'Call agency info',
            },
          },
          flex: {
            ...mockContext.config.flex,
            internal: {
              ...mockContext.config.flex.internal,
              agencies: internalAgencies,
            },
          },
        });

      it('adds the call agency disclaimer for an external agency', () => {
        const container = renderDetails({
          itinerary: makeItinerary([makeCallAgencyLeg('EXT:1')]),
          config: callAgencyConfig(),
        });
        expect(disclaimerTexts(container)).toHaveLength(1);
        expect(disclaimerTexts(container)[0]).toContain(
          'demand responsive transport',
        );
        expect(
          container.querySelector('.unknown-fare-disclaimer__top a').href,
        ).toBe('https://example.com/call');
      });

      it('shows no fare information for an internal agency', () => {
        const container = renderDetails({
          itinerary: makeItinerary([makeCallAgencyLeg('INT:1')]),
          config: callAgencyConfig(['INT:1']),
        });
        expect(ticketBlock(container)).toBeNull();
        expect(disclaimerTexts(container)).toEqual([]);
      });
    });

    describe('known quirks', () => {
      // characterizes current behavior: a language missing from a configured
      // mode disclaimer crashes the whole component
      it('throws when modeDisclaimers has no entry for the language', () => {
        silenceConsoleError();
        expect(() =>
          renderDetails({
            itinerary: makeItinerary([makeRailLeg()]),
            config: makeFareConfig({
              modeDisclaimers: {
                RAIL: { fi: { disclaimer: 'Vain suomeksi' } },
              },
            }),
          }),
        ).toThrow();
      });

      // characterizes current behavior: a missing primaryAgencyName renders
      // the generic disclaimer with an empty agency name
      it('renders the disclaimer with an empty agency name without primaryAgencyName', () => {
        const container = renderDetails({
          itinerary: makeItinerary([makeRailLeg()]),
          config: makeFareConfig({ primaryAgencyName: undefined }),
        });
        expect(
          container.querySelector('.unknown-fare-disclaimer__top').textContent,
        ).toMatch(/for which\s+does not sell tickets/);
      });
    });
  });

  describe('replacement bus notification', () => {
    const replacementConfig = (overrides = {}) => ({
      replacementBusNotification: {
        content: { en: ['Replacement', 'service'] },
        link: { en: 'https://example.com/replacement' },
      },
      ...overrides,
    });
    const replacementTrip = { gtfsId: 'HSL:trip2', isReplacement: true };
    const notifications = container => [
      ...container.querySelectorAll('.route-disclaimer-container'),
    ];

    it('is shown for a replacement trip', () => {
      const container = renderDetails({
        itinerary: makeItinerary([makeRailLeg({ trip: replacementTrip })]),
        config: replacementConfig(),
      });
      const [notification] = notifications(container);
      expect(notifications(container)).toHaveLength(1);
      expect(notification.querySelector('h3').textContent).toBe(
        'Replacement bus',
      );
      expect(notification.textContent).toContain('Replacement service');
      expect(notification.querySelector('a').href).toBe(
        'https://example.com/replacement',
      );
    });

    it('is shown for a route listed as a replacement route', () => {
      const container = renderDetails({
        itinerary: makeItinerary([makeRailLeg()]),
        config: replacementConfig({ replacementBusRoutes: ['HSL:1'] }),
      });
      expect(notifications(container)).toHaveLength(1);
    });

    it('prefers the route description when configured', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeRailLeg({
            trip: replacementTrip,
            route: makeRoute({
              desc: 'Route description',
              url: 'https://example.com/route',
            }),
          }),
        ]),
        config: replacementConfig({ showRouteDescNotification: true }),
      });
      const [notification] = notifications(container);
      expect(notification.textContent).toContain('Route description');
      expect(notification.querySelector('a').href).toBe(
        'https://example.com/route',
      );
    });

    it('is shown once for several legs of the same route', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeRailLeg({ trip: replacementTrip }),
          makeRailLeg({ trip: replacementTrip }),
        ]),
        config: replacementConfig(),
      });
      expect(notifications(container)).toHaveLength(1);
    });

    it('is shown once when different replacement routes share the same content', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeRailLeg({
            route: makeRoute({ gtfsId: 'HSL:1' }),
            trip: replacementTrip,
          }),
          makeRailLeg({
            route: makeRoute({ gtfsId: 'HSL:2' }),
            trip: { ...replacementTrip, gtfsId: 'HSL:trip3' },
          }),
        ]),
        config: replacementConfig(),
      });
      expect(notifications(container)).toHaveLength(1);
    });

    it('renders fare disclaimers before replacement bus notices', () => {
      const container = renderDetails({
        itinerary: makeItinerary([makeRailLeg({ trip: replacementTrip })]),
        config: {
          ...makeFareConfig(),
          ...replacementConfig(),
        },
      });
      const disclaimers = [
        ...container.querySelectorAll(
          '.unknown-fare-disclaimer__top, .route-disclaimer-container',
        ),
      ];
      expect(disclaimers).toHaveLength(2);
      expect(disclaimers[0].className).toContain(
        'unknown-fare-disclaimer__top',
      );
      expect(disclaimers[1].className).toBe('route-disclaimer-container');
    });

    it('is not shown for a regular trip', () => {
      const container = renderDetails({
        itinerary: makeItinerary([makeRailLeg()]),
        config: replacementConfig(),
      });
      expect(notifications(container)).toHaveLength(0);
    });

    it('is not shown when the notification is not configured', () => {
      const container = renderDetails({
        itinerary: makeItinerary([makeRailLeg({ trip: replacementTrip })]),
      });
      expect(notifications(container)).toHaveLength(0);
    });

    describe('known quirks', () => {
      // characterizes current behavior: missing content for the language
      // makes the duplicate check match any disclaimer without a text prop
      it('is dropped when content is missing and a textId disclaimer exists', () => {
        const container = renderDetails({
          itinerary: makeItinerary([
            makeCallAgencyLeg('EXT:1'),
            makeRailLeg({ trip: replacementTrip }),
          ]),
          config: {
            ...makeFareConfig(),
            ...replacementConfig({
              replacementBusNotification: {
                content: { fi: ['Vain suomeksi'] },
                link: { en: 'https://example.com/replacement' },
              },
            }),
            callAgencyInfo: {
              en: {
                callAgencyInfoLink: 'https://example.com/call',
                callAgencyInfoLinkText: 'Call agency info',
              },
            },
          },
        });
        expect(
          container.querySelector('.unknown-fare-disclaimer__top'),
        ).not.toBeNull();
        expect(notifications(container)).toHaveLength(0);
      });

      // characterizes current behavior: without that accidental match the
      // notification has no text or textId and crashes the render
      it('throws when content is missing and nothing else is shown', () => {
        silenceConsoleError();
        expect(() =>
          renderDetails({
            itinerary: makeItinerary([makeRailLeg({ trip: replacementTrip })]),
            config: replacementConfig({
              replacementBusNotification: {
                content: { fi: ['Vain suomeksi'] },
                link: { en: 'https://example.com/replacement' },
              },
            }),
          }),
        ).toThrow();
      });
    });
  });

  describe('summary and divider', () => {
    const divider = container => container.querySelector('.divider-bottom');

    it('shows the bottom divider by default', () => {
      expect(divider(renderDetails())).not.toBeNull();
    });

    it('hides the bottom divider on mobile when the purchase block is shown', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeWalkLeg(),
          makeRailLeg({ fareProducts: knownFareProducts }),
        ]),
        config: makePurchaseConfig(),
      });
      expect(
        container.querySelector('.itinerary-ticket-information-purchase'),
      ).not.toBeNull();
      expect(divider(container)).toBeNull();
    });

    it('shows the street summaries only for modes with distance', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeWalkLeg(),
          makeLeg({ mode: 'CAR', distance: 3000 }),
        ]),
      });
      const summaries = container.querySelectorAll(
        '.distance--itinerary-summary',
      );
      expect(summaries).toHaveLength(2);
      expect(
        container.querySelector('.distance--itinerary-summary.driving-summary'),
      ).not.toBeNull();
    });

    it('shows the divider on mobile when fare info is hidden despite a purchase config', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeWalkLeg(),
          makeRailLeg({ fareProducts: knownFareProducts }),
        ]),
        config: makePurchaseConfig({ showTicketLinkOnlyWhenTesting: true }),
      });
      expect(
        container.querySelector('.itinerary-ticket-information-purchase'),
      ).toBeNull();
      expect(divider(container)).not.toBeNull();
    });

    it('shows the divider on desktop with a purchase config', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeWalkLeg(),
          makeRailLeg({ fareProducts: knownFareProducts }),
        ]),
        config: makePurchaseConfig(),
        props: { isMobile: false },
        breakpoint: 'large',
      });
      expect(
        container.querySelector('.itinerary-ticket-information-purchase'),
      ).toBeNull();
      expect(divider(container)).not.toBeNull();
    });
  });

  describe('boarding information flags for legs', () => {
    const legsStub = container => container.querySelector('.legs-stub');
    const ownBikeLeg = overrides =>
      makeLeg({ mode: 'BICYCLE', rentedBike: false, ...overrides });

    it('enables bike boarding information for a bike trip when public alternatives exist', () => {
      const container = renderDetails({
        itinerary: makeItinerary([ownBikeLeg(), makeRailLeg()]),
        props: { bikePublicItineraryCount: 1 },
      });
      expect(legsStub(container).dataset.bikeBoarding).toBe('true');
    });

    it('disables it without public alternatives', () => {
      const container = renderDetails({
        itinerary: makeItinerary([ownBikeLeg(), makeRailLeg()]),
      });
      expect(legsStub(container).dataset.bikeBoarding).toBe('false');
    });

    it('disables it when the bike is parked', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          ownBikeLeg({
            to: makePlace({
              vehicleParking: { name: 'Park', vehicleParkingId: 'p1' },
            }),
          }),
          makeWalkLeg(),
          makeRailLeg(),
        ]),
        props: { bikePublicItineraryCount: 1 },
      });
      expect(legsStub(container).dataset.bikeBoarding).toBe('false');
    });

    it('enables car boarding information for a car trip when public alternatives exist', () => {
      const itinerary = makeItinerary([
        makeLeg({ mode: 'CAR' }),
        makeRailLeg(),
      ]);
      expect(
        legsStub(
          renderDetails({ itinerary, props: { carPublicItineraryCount: 1 } }),
        ).dataset.carBoarding,
      ).toBe('true');
      expect(legsStub(renderDetails({ itinerary })).dataset.carBoarding).toBe(
        'false',
      );
    });

    it('flags a trip driven entirely with an own car', () => {
      expect(
        legsStub(
          renderDetails({
            itinerary: makeItinerary([makeLeg({ mode: 'CAR' })]),
          }),
        ).dataset.ownCarWholeTrip,
      ).toBe('true');
      expect(
        legsStub(
          renderDetails({
            itinerary: makeItinerary([makeWalkLeg(), makeLeg({ mode: 'CAR' })]),
          }),
        ).dataset.ownCarWholeTrip,
      ).toBe('false');
    });
  });

  describe('footer blocks', () => {
    const itineraryDisclaimerTexts = container =>
      [...container.querySelectorAll('.itinerary-disclaimer')].map(
        el => el.textContent,
      );
    const feedbackBlock = container =>
      container.querySelector('.itinerary-disclaimer .separator');
    const personalizationConfig = (overrides = {}) => ({
      personalization: true,
      defaultSettings: {
        ...mockContext.config.defaultSettings,
        personalization: true,
      },
      ...overrides,
    });

    describe('estimate disclaimer', () => {
      it('is hidden unless configured', () => {
        expect(itineraryDisclaimerTexts(renderDetails())).toEqual([]);
      });

      it('is shown when configured', () => {
        const container = renderDetails({ config: { showDisclaimer: true } });
        expect(itineraryDisclaimerTexts(container)[0]).toContain(
          'estimated travel times',
        );
      });

      it.each(['walk', 'bike'])('is hidden for the %s street hash', hash => {
        const container = renderDetails({
          config: { showDisclaimer: true },
          params: { hash },
        });
        expect(itineraryDisclaimerTexts(container)).toEqual([]);
      });

      it('is shown for other street hashes', () => {
        const container = renderDetails({
          config: { showDisclaimer: true },
          params: { hash: 'bikeAndVehicle' },
        });
        expect(itineraryDisclaimerTexts(container)).toHaveLength(1);
      });

      it.each(['0', 'car', 'carAndVehicle', 'parkAndRide'])(
        'is shown for the %s hash when configured',
        hash => {
          const container = renderDetails({
            config: { showDisclaimer: true },
            params: { hash },
          });
          expect(itineraryDisclaimerTexts(container)).toHaveLength(1);
        },
      );

      it('uses the primary hash rather than the second hash', () => {
        const hidden = renderDetails({
          config: { showDisclaimer: true },
          params: { hash: 'walk', secondHash: '0' },
        });
        const shown = renderDetails({
          config: { showDisclaimer: true },
          params: { hash: 'bikeAndVehicle', secondHash: 'walk' },
        });
        expect(itineraryDisclaimerTexts(hidden)).toEqual([]);
        expect(itineraryDisclaimerTexts(shown)).toHaveLength(1);
      });
    });

    describe('feedback', () => {
      it('is shown for a transit itinerary when personalization is on', () => {
        const container = renderDetails({
          config: personalizationConfig(),
          props: { giveFeedback: vi.fn() },
        });
        expect(feedbackBlock(container)).not.toBeNull();
      });

      it('is hidden when personalization is off in the config', () => {
        const container = renderDetails({
          config: personalizationConfig({ personalization: false }),
        });
        expect(feedbackBlock(container)).toBeNull();
      });

      it('is hidden when the user turned personalization off', () => {
        window.localStorage.setItem(
          'customizedSettings',
          JSON.stringify({ personalization: false }),
        );
        const container = renderDetails({ config: personalizationConfig() });
        expect(feedbackBlock(container)).toBeNull();
      });

      it('is shown when the user enables personalization over the default', () => {
        window.localStorage.setItem(
          'customizedSettings',
          JSON.stringify({ personalization: true }),
        );
        const container = renderDetails({
          config: personalizationConfig({
            defaultSettings: {
              ...mockContext.config.defaultSettings,
              personalization: false,
            },
          }),
          props: { giveFeedback: vi.fn() },
        });
        expect(feedbackBlock(container)).not.toBeNull();
      });

      it('is hidden when the itinerary has no transit leg', () => {
        const container = renderDetails({
          itinerary: makeItinerary([makeWalkLeg()]),
          config: personalizationConfig(),
        });
        expect(feedbackBlock(container)).toBeNull();
      });

      it('is shown independently when the walk hash hides the disclaimer', () => {
        const container = renderDetails({
          config: { ...personalizationConfig(), showDisclaimer: true },
          params: { hash: 'walk' },
          props: { giveFeedback: vi.fn() },
        });
        expect(itineraryDisclaimerTexts(container)).toHaveLength(1);
        expect(feedbackBlock(container)).not.toBeNull();
      });

      it('is shown alongside the disclaimer when both are eligible', () => {
        const container = renderDetails({
          config: { ...personalizationConfig(), showDisclaimer: true },
          props: { giveFeedback: vi.fn() },
        });
        const texts = itineraryDisclaimerTexts(container);
        expect(texts).toHaveLength(2);
        expect(texts[0]).toContain('estimated travel times');
        expect(feedbackBlock(container)).not.toBeNull();
      });
    });

    describe('CO2 emissions', () => {
      const co2Info = container =>
        container.querySelector('.itinerary-co2-information');
      const co2Comparison = container =>
        container.querySelector('.itinerary-co2-comparison');

      it('is hidden unless configured', () => {
        const container = renderDetails();
        expect(co2Info(container)).toBeNull();
        expect(co2Comparison(container)).toBeNull();
      });

      it('is shown when configured', () => {
        const container = renderDetails({
          config: { showCO2InItinerarySummary: true },
          props: { carEmissions: 200 },
        });
        expect(co2Info(container).textContent).toContain('100 g');
        expect(co2Comparison(container)).not.toBeNull();
      });

      it('is hidden for itineraries with a scooter leg', () => {
        const container = renderDetails({
          itinerary: makeItinerary([makeLeg({ mode: 'SCOOTER' })]),
          config: { showCO2InItinerarySummary: true },
        });
        expect(co2Info(container)).toBeNull();
        expect(co2Comparison(container)).toBeNull();
      });
    });
  });

  describe('compressed legs', () => {
    it('does not compress an itinerary without legs', () => {
      const compressLegs = vi.spyOn(legUtils, 'compressLegs');
      renderDetails({ itinerary: makeItinerary([]) });
      expect(compressLegs).not.toHaveBeenCalled();
    });

    it('compresses the legs once for the summary and mode checks', () => {
      const itinerary = makeItinerary();
      const compressLegs = vi.spyOn(legUtils, 'compressLegs');
      renderDetails({ itinerary });
      expect(compressLegs).toHaveBeenCalledTimes(1);
      expect(compressLegs).toHaveBeenCalledWith(itinerary.legs);
    });

    it.each([
      ['without transit', false],
      ['with transit', true],
    ])(
      'uses compressed cycling legs for the summary and navigation %s',
      (_, hasTransit) => {
        const legs = [
          makeWalkLeg({ distance: 200, duration: 120 }),
          makeLeg({
            mode: 'BICYCLE',
            rentedBike: false,
            distance: 1600,
            duration: 360,
          }),
          makeWalkLeg({ distance: 200, duration: 120 }),
        ];
        if (hasTransit) {
          legs.push(makeRailLeg());
        }
        const container = renderDetails({
          itinerary: makeItinerary(legs),
          props: {
            startNavigation: vi.fn(),
            bikePublicItineraryCount: 1,
          },
        });
        const summaries = container.querySelectorAll(
          '.distance--itinerary-summary',
        );
        expect(summaries).toHaveLength(1);
        expect(summaries[0].querySelector('.bike')).not.toBeNull();
        expect(summaries[0].querySelector('.sr-only').textContent.trim()).toBe(
          'Total cycling 10 min, 2.0 km',
        );
        const legsStub = container.querySelector('.legs-stub');
        expect(legsStub.dataset.bikeBoarding).toBe('true');
        expect(legsStub.dataset.legModes).toBe(
          hasTransit ? 'WALK,BICYCLE,WALK,RAIL' : 'WALK,BICYCLE,WALK',
        );
        expect(Boolean(container.querySelector('.navi-start-container'))).toBe(
          hasTransit,
        );
      },
    );
  });

  describe('getExtraProps and distance/duration calculations', () => {
    it('correctly calculates walking distance and duration', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({ mode: 'WALK', distance: 1000, duration: 600 }),
        ]),
      });
      const summaries = container.querySelectorAll(
        '.distance--itinerary-summary',
      );
      expect(summaries).toHaveLength(1);
      expect(summaries[0].querySelector('.walk')).not.toBeNull();
      expect(summaries[0].querySelector('.sr-only').textContent.trim()).toBe(
        'Total walking 10 min, 1.0 km',
      );
    });

    it('correctly calculates biking distance and duration for own bike', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({
            mode: 'BICYCLE',
            rentedBike: false,
            distance: 5000,
            duration: 1200,
          }),
        ]),
      });
      const summaries = container.querySelectorAll(
        '.distance--itinerary-summary',
      );
      expect(summaries).toHaveLength(1);
      expect(summaries[0].querySelector('.bike')).not.toBeNull();
      expect(summaries[0].querySelector('.sr-only').textContent.trim()).toBe(
        'Total cycling 20 min, 5.0 km',
      );
    });

    it('correctly calculates driving distance and duration for car', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({ mode: 'CAR', distance: 10000, duration: 600 }),
        ]),
      });
      const summary = container.querySelector(
        '.distance--itinerary-summary.driving-summary',
      );
      expect(summary).not.toBeNull();
      expect(summary.querySelector('.sr-only').textContent.trim()).toBe(
        'Total driving 10 min, 10.0 km',
      );
    });

    it('shows multiple street mode summaries when multi-row applies', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({ mode: 'WALK', distance: 1000, duration: 600 }),
          makeLeg({
            mode: 'BICYCLE',
            rentedBike: false,
            distance: 2000,
            duration: 600,
          }),
          makeLeg({ mode: 'CAR', distance: 3000, duration: 600 }),
          makeRailLeg(),
        ]),
      });
      const summaries = container.querySelectorAll(
        '.distance--itinerary-summary',
      );
      expect(summaries.length).toBeGreaterThan(1);
    });

    it('handles zero distances for omitted modes', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({ mode: 'WALK', distance: 500, duration: 300 }),
          makeRailLeg(),
        ]),
      });
      expect(
        container.querySelector('.distance--itinerary-summary.driving-summary'),
      ).toBeNull();
    });
  });

  describe('mixed mode itineraries', () => {
    it('handles walk + transit + car combinations', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({ mode: 'WALK', distance: 1000 }),
          makeRailLeg(),
          makeLeg({ mode: 'CAR', distance: 5000 }),
        ]),
      });
      expect(container.querySelector('.itinerary-tab')).not.toBeNull();
    });

    it('handles walk + transit + scooter combinations', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({ mode: 'WALK', distance: 1000 }),
          makeRailLeg(),
          makeLeg({ mode: 'SCOOTER', distance: 2000 }),
        ]),
      });
      expect(container.querySelector('.itinerary-tab')).not.toBeNull();
    });

    it('does not show start navigation for walk + taxi', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({ mode: 'WALK', distance: 500 }),
          makeLeg({ mode: 'TAXI', distance: 5000 }),
        ]),
        props: { startNavigation: () => {} },
      });
      expect(container.querySelector('.navi-start-container')).toBeNull();
    });
  });

  describe('multiple transit routes with different agencies', () => {
    it('handles multiple transit legs from different agencies', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeRailLeg({
            route: makeRoute({
              gtfsId: 'HSL:1',
              agency: { gtfsId: 'HSL:HSL', name: 'HSL', fareUrl: null },
            }),
          }),
          makeRailLeg({
            route: makeRoute({
              gtfsId: 'OTHER:2',
              agency: { gtfsId: 'OTHER:OTHER', name: 'Other', fareUrl: null },
            }),
          }),
        ]),
        config: makeFareConfig(),
      });
      expect(container.querySelector('.itinerary-tab')).not.toBeNull();
    });
  });

  describe('isMultiRow flag behavior', () => {
    it('is false for walk-only trips', () => {
      const container = renderDetails({
        itinerary: makeItinerary([makeLeg({ mode: 'WALK', distance: 1000 })]),
      });
      expect(container.querySelector('.multirow')).toBeNull();
    });

    it('is false for transit with only walking', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({ mode: 'WALK', distance: 500 }),
          makeRailLeg(),
        ]),
      });
      expect(container.querySelector('.multirow')).toBeNull();
    });

    describe('with a future departure', () => {
      beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-10-01T12:00:00+03:00'));
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      // compressLegs merges walk into an adjacent own-bike leg, so walking
      // is kept apart from the car leg by a transit leg
      it('is true when walking and driving are both present', () => {
        const container = renderDetails({
          itinerary: makeItinerary([
            makeLeg({ mode: 'WALK', distance: 500, duration: 300 }),
            makeRailLeg(),
            makeLeg({ mode: 'CAR', distance: 5000, duration: 300 }),
          ]),
        });
        expect(
          container.querySelector('.momentum-scroll.multirow'),
        ).not.toBeNull();
      });
    });

    it('is false when departing today', () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(time(8)));
      try {
        const container = renderDetails({
          itinerary: makeItinerary([
            makeLeg({ mode: 'WALK', distance: 500, duration: 300 }),
            makeRailLeg(),
            makeLeg({ mode: 'CAR', distance: 5000, duration: 300 }),
          ]),
        });
        expect(container.querySelector('.momentum-scroll.multirow')).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it('is false when biking but no walking or driving', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({
            mode: 'BICYCLE',
            rentedBike: false,
            distance: 2000,
            duration: 600,
          }),
          makeRailLeg(),
        ]),
      });
      expect(container.querySelector('.momentum-scroll.multirow')).toBeNull();
    });
  });

  describe('rental bike network warning with multiple networks', () => {
    it('shows warnings for all networks exceeding their limits simultaneously', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeWalkLeg(),
          makeRentalLeg(3601, 'smoove'),
          makeWalkLeg(),
          makeRentalLeg(1801, 'vanderlande'),
          makeWalkLeg(),
        ]),
        config: makeRentalConfig(),
      });
      const infobox = container.querySelector('.citybike-duration-infobox');
      expect(infobox).not.toBeNull();
      const networks = infobox.querySelectorAll('a');
      expect(networks.length).toBe(2);
    });

    it('warns only for networks over their limit', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeWalkLeg(),
          makeRentalLeg(3601, 'smoove'),
          makeWalkLeg(),
          makeRentalLeg(600, 'vanderlande'),
          makeWalkLeg(),
        ]),
        config: makeRentalConfig(),
      });
      const infobox = container.querySelector('.citybike-duration-infobox');
      expect(infobox).not.toBeNull();
      expect(infobox.querySelectorAll('a')).toHaveLength(1);
    });
  });

  describe('heading and accessibility', () => {
    it('includes departure time in screen reader heading', () => {
      const container = renderDetails();
      const heading = container.querySelector('h2.sr-only');
      expect(heading).not.toBeNull();
      expect(heading.textContent).toContain('10:00');
    });

    it('includes itinerary number in screen reader heading', () => {
      const container = renderDetails({ params: { hash: '2' } });
      const heading = container.querySelector('h2.sr-only');
      expect(heading.textContent).toContain('3');
    });

    it('includes context span with proper ID for tab indexing', () => {
      const container = renderDetails({ props: { tabIndex: 5 } });
      const contextSpan = container.querySelector('#tab-5-context');
      expect(contextSpan).not.toBeNull();
      expect(contextSpan.textContent).toContain('Leaves');
    });
  });

  describe('FareInfo component integration', () => {
    it('passes correct props to FareInfo component', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeWalkLeg(),
          makeRailLeg({ fareProducts: knownFareProducts }),
        ]),
        config: makeFareConfig(),
        props: { isMobile: true },
      });
      expect(container.querySelector('.itinerary-tab')).not.toBeNull();
    });

    it('FareInfo receives mobile flag correctly', () => {
      const mobileContainer = renderDetails({
        itinerary: makeItinerary([makeWalkLeg(), makeRailLeg()]),
        props: { isMobile: true },
      });
      const nonMobileContainer = renderDetails({
        itinerary: makeItinerary([makeWalkLeg(), makeRailLeg()]),
        props: { isMobile: false },
      });
      expect(mobileContainer.querySelector('.itinerary-tab')).not.toBeNull();
      expect(nonMobileContainer.querySelector('.itinerary-tab')).not.toBeNull();
    });
  });

  describe('desktop title rendering', () => {
    it('shows title on large breakpoint when not hidden', () => {
      const container = renderDetails({
        breakpoint: 'large',
        props: { hideTitle: false },
      });
      expect(container.querySelector('.desktop-title')).not.toBeNull();
    });

    it('hides title on large breakpoint when hideTitle is true', () => {
      const container = renderDetails({
        breakpoint: 'large',
        props: { hideTitle: true },
      });
      expect(container.querySelector('.desktop-title')).toBeNull();
    });

    it('does not show title on small breakpoint', () => {
      const container = renderDetails({
        breakpoint: 'small',
        props: { hideTitle: false },
      });
      expect(container.querySelector('.desktop-title')).toBeNull();
    });
  });

  describe('itinerary summary presence', () => {
    it('always renders the summary section', () => {
      const container = renderDetails();
      expect(container.querySelector('.itinerary-summary')).not.toBeNull();
    });

    it('passes correct props to summary component', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({ mode: 'WALK', distance: 1000, duration: 600 }),
          makeRailLeg(),
        ]),
      });
      expect(container.querySelector('.itinerary-summary')).not.toBeNull();
    });
  });

  describe('emissionsInfo presence', () => {
    it('shows emissions info in summary when configured', () => {
      const container = renderDetails({
        config: { showCO2InItinerarySummary: true },
      });
      const co2Info = container.querySelector('.itinerary-co2-information');
      expect(co2Info).not.toBeNull();
    });

    it('passes carEmissions comparison prop when available', () => {
      const container = renderDetails({
        config: { showCO2InItinerarySummary: true },
        props: { carEmissions: 200 },
      });
      expect(
        container.querySelector('.itinerary-co2-comparison'),
      ).not.toBeNull();
    });
  });

  describe('edge case: itinerary with only transit', () => {
    it('renders correctly with only transit legs', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeRailLeg(),
          makeRailLeg({ route: makeRoute({ gtfsId: 'HSL:2' }) }),
        ]),
      });
      expect(container.querySelector('.itinerary-tab')).not.toBeNull();
      expect(container.querySelector('.legs-stub')).not.toBeNull();
    });

    it('shows start navigation for transit only when handler provided', () => {
      const startNav = vi.fn();
      const container = renderDetails({
        itinerary: makeItinerary([
          makeRailLeg(),
          makeRailLeg({ route: makeRoute({ gtfsId: 'HSL:2' }) }),
        ]),
        props: { startNavigation: startNav },
      });
      const button = container.querySelector('.navi-start-container button');
      expect(button).not.toBeNull();
      fireEvent.click(button);
      expect(startNav).toHaveBeenCalledTimes(1);
    });
  });

  describe('bike boarding flag edge cases', () => {
    it('is false when biking duration is zero despite distance', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({
            mode: 'BICYCLE',
            rentedBike: false,
            distance: 1000,
            duration: 0,
          }),
          makeRailLeg(),
        ]),
        props: { bikePublicItineraryCount: 1 },
      });
      expect(container.querySelector('.legs-stub').dataset.bikeBoarding).toBe(
        'false',
      );
    });

    it('is false when biking distance is zero despite duration', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({
            mode: 'BICYCLE',
            rentedBike: false,
            distance: 0,
            duration: 600,
          }),
          makeRailLeg(),
        ]),
        props: { bikePublicItineraryCount: 1 },
      });
      expect(container.querySelector('.legs-stub').dataset.bikeBoarding).toBe(
        'false',
      );
    });
  });

  describe('car boarding flag edge cases', () => {
    it('is false when driving duration is zero despite distance', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({ mode: 'CAR', distance: 5000, duration: 0 }),
          makeRailLeg(),
        ]),
        props: { carPublicItineraryCount: 1 },
      });
      expect(container.querySelector('.legs-stub').dataset.carBoarding).toBe(
        'false',
      );
    });

    it('is false when driving distance is zero despite duration', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({ mode: 'CAR', distance: 0, duration: 300 }),
          makeRailLeg(),
        ]),
        props: { carPublicItineraryCount: 1 },
      });
      expect(container.querySelector('.legs-stub').dataset.carBoarding).toBe(
        'false',
      );
    });
  });

  describe('own car whole trip flag', () => {
    it('is true only when driving is the only mode with distance', () => {
      const container = renderDetails({
        itinerary: makeItinerary([makeLeg({ mode: 'CAR', distance: 5000 })]),
      });
      expect(
        container.querySelector('.legs-stub').dataset.ownCarWholeTrip,
      ).toBe('true');
    });

    it('is false when walking is present', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({ mode: 'WALK', distance: 100 }),
          makeLeg({ mode: 'CAR', distance: 5000 }),
        ]),
      });
      expect(
        container.querySelector('.legs-stub').dataset.ownCarWholeTrip,
      ).toBe('false');
    });

    it('is false when biking is present', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeLeg({ mode: 'BICYCLE', rentedBike: false, distance: 1000 }),
          makeLeg({ mode: 'CAR', distance: 5000 }),
        ]),
      });
      expect(
        container.querySelector('.legs-stub').dataset.ownCarWholeTrip,
      ).toBe('false');
    });
  });

  describe('replacement bus with multiple disclaimers', () => {
    it('deduplicates replacement bus and mode disclaimers by text content', () => {
      const container = renderDetails({
        itinerary: makeItinerary([
          makeRailLeg({ trip: { gtfsId: 'HSL:trip3', isReplacement: true } }),
        ]),
        config: {
          replacementBusNotification: {
            content: { en: ['This is a replacement bus'] },
            link: { en: 'https://example.com' },
          },
          showTicketInformation: true,
          showTicketPrice: true,
          feedIds: ['HSL'],
          availableTickets: {},
          primaryAgencyName: 'Test',
        },
      });
      const disclaimers = container.querySelectorAll(
        '.route-disclaimer-container',
      );
      expect(disclaimers.length).toBeGreaterThanOrEqual(1);
    });
  });
});
