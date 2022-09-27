import React from 'react';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl, shallowWithIntl } from '../helpers/mock-intl-enzyme';
import ItinerarySummaryMessage from '../../../app/component/ItinerarySummaryListContainer/components/ItinerarySummaryMessage';
import { PlannerMessageType } from '../../../app/constants';

const TestLocation = {
  Outside: {
    lat: 10.0,
    lon: 10.0,
    address: 'Atlantic',
  },

  Rautatientori: {
    address: 'Rautatientori',
    lat: 60.170384,
    lon: 24.939846,
  },

  Mannerheimintie_89: {
    lat: 60.194445473775644,
    lon: 24.904975891113285,
    address: 'Mannerheimintie89, Helsinki',
  },

  Lappers: {
    address: 'Lappers',
    lat: 60.20342859480837,
    lon: 24.039373397827152,
  },
};

const HelsinkiRegionBounds = [
  [24.0049, 59.78402],
  [24.0049, 60.5806],
  [25.5345, 60.5806],
  [25.5345, 59.78402],
];

const defaultProps = {
  locationState: {
    type: 'CurrentLocation',
    lat: 0,
    lon: 0,
    status: 'no-location',
    hasLocation: false,
    isLocationingInProgress: false,
    isReverseGeocodingInProgress: false,
    locationingFailed: false,
  },
  error: undefined,
  areaPolygon: HelsinkiRegionBounds,
  minDistanceBetweenFromAndTo: 100.0,
  nationalServiceLink: {
    fi: {
      name: 'matka.fi',
      href: 'https://opas.matka.fi/',
    },
    sv: {
      name: 'matka.fi',
      href: 'https://opas.matka.fi/sv/',
    },
    en: {
      name: 'matka.fi',
      href: 'https://opas.matka.fi/en/',
    },
  },

  from: {},
  to: {},
  searchTime: 123456780,
  currentTime: 1656580024206,
};

const matchElement = (componentName, propName, propValue) => enzymeWrapper =>
  enzymeWrapper.name() === componentName &&
  enzymeWrapper.prop(propName) === propValue;

/**
 * Test case creation helper.
 *
 * @param {Object.<String, any>} props `props` for `ItinerarySummaryMessage` component.
 * @param {String} expectPropValue, expectPropName
 */
const expectElementWithId = (
  props,
  expectComponent,
  expectPropName,
  expectPropValue,
) => {
  const wrapper = shallowWithIntl(<ItinerarySummaryMessage {...props} />, {
    context: mockContext,
    childContextTypes: mockChildContextTypes,
  });

  const assertErrorMessage = `<${expectComponent} ${expectPropName}="${expectPropValue}" .../> not found.`;
  expect(
    wrapper.findWhere(
      matchElement(expectComponent, expectPropName, expectPropValue),
    ),
  ).to.have.length(1, assertErrorMessage);
};

/**
 * Expect rendered *<ItinerarySummaryMessage {...props}/>* component to
 * contain a child component *componentName*.
 * @param {Object.<String, *>} props Properties for ItinerarySummaryMessage.
 * @param {String} componentName Component name to expect.
 * @param {String} [mountMethod] Should Enzyme render component by 'shallow'
 *                               (default) or 'mount'.
 */
const expectElement = (props, componentName, mountMethod = 'shallow') => {
  const opts = {
    context: mockContext,
    childContextTypes: mockChildContextTypes,
  };

  const wrapper =
    mountMethod === 'shallow'
      ? shallowWithIntl(<ItinerarySummaryMessage {...props} />, opts)
      : mountWithIntl(<ItinerarySummaryMessage {...props} />, opts);

  const assertErrorMessage = `<${componentName} .../> not found.`;
  expect(
    wrapper.findWhere(enzymeWrapper => enzymeWrapper.name() === componentName),
  ).to.have.length(1, assertErrorMessage);
};

describe('<ItinerarySummaryMessage />', () => {
  it('should render without crashing', () => {
    const wrapper = mountWithIntl(
      <div>
        <ItinerarySummaryMessage {...defaultProps} />
      </div>,
      { context: mockContext, childContextTypes: mockChildContextTypes },
    );

    expect(wrapper.isEmptyRender()).to.equal(false);
  });

  describe('error messages', () => {
    const DAY = 24 * 3600 * 1000;
    const DATE_2022_01_01 = 1640995200000;

    it('renders "see national service" link when outside area', () => {
      const props = {
        ...defaultProps,
        routingErrors: [
          {
            code: PlannerMessageType.OutsideBounds,
            inputField: 'FROM',
          },
        ],
        from: TestLocation.Outside,
        to: TestLocation.Rautatientori,
      };
      expectElement(props, 'NationalServiceLink', false);
    });

    it('renders message when origin out of bounds', () => {
      expectElementWithId(
        {
          ...defaultProps,
          from: TestLocation.Outside,
          to: TestLocation.Rautatientori,
          routingErrors: [
            { code: PlannerMessageType.OutsideBounds, inputField: 'FROM' },
          ],
        },
        'ErrorCard',
        'msgId',
        'origin-outside-service',
      );
    });

    it('renders message when destination out of bounds', () => {
      expectElementWithId(
        {
          ...defaultProps,
          from: TestLocation.Rautatientori,
          to: TestLocation.Outside,
          routingErrors: [
            { code: PlannerMessageType.OutsideBounds, inputField: 'TO' },
          ],
        },
        'ErrorCard',
        'msgId',
        'destination-outside-service',
      );
    });

    it('renders message when origin and destination out of bounds', () => {
      expectElementWithId(
        {
          ...defaultProps,
          from: TestLocation.Outside,
          to: TestLocation.Outside,
          routingErrors: [
            { code: PlannerMessageType.OutsideBounds, inputField: 'TO' },
            { code: PlannerMessageType.OutsideBounds, inputField: 'FROM' },
          ],
        },
        'ErrorCard',
        'msgId',
        'router-outside-bounds-3',
      );
    });

    it('renders message when: outside service period', () => {
      expectElementWithId(
        {
          ...defaultProps,
          currentTime: DATE_2022_01_01,
          searchTime: DATE_2022_01_01 + 180 * DAY,
          from: TestLocation.Rautatientori,
          to: TestLocation.Mannerheimintie_89,
          routingErrors: [
            {
              code: PlannerMessageType.OutsideServicePeriod,
              inputField: 'DATE_TIME',
            },
          ],
        },
        'ErrorCard',
        'msgId',
        'router-outside-service-period',
      );
    });

    it('renders an action link when: outside service period', () => {
      expectElement(
        {
          ...defaultProps,
          currentTime: DATE_2022_01_01,
          searchTime: DATE_2022_01_01 + 180 * DAY,
          from: TestLocation.Rautatientori,
          to: TestLocation.Mannerheimintie_89,
          routingErrors: [
            {
              code: PlannerMessageType.OutsideServicePeriod,
              inputField: 'DATE_TIME',
            },
          ],
        },
        'PastLink',
      );
    });

    it('renders message when: search time is in the past', () => {
      expectElementWithId(
        {
          ...defaultProps,
          currentTime: DATE_2022_01_01,
          searchTime: DATE_2022_01_01 - 2 * DAY,
          from: TestLocation.Rautatientori,
          to: TestLocation.Mannerheimintie_89,
          walking: true,
        },
        'ErrorCard',
        'msgId',
        'itinerary-in-the-past',
      );
    });
  });
});

/*
Test case route queries
-----------------------

  NO_TRANSIT_CONNECTION
    /reitti/Valittu%20sijainti%3A%3A60.161908100606325%2C24.981869459152225/Valittu%20sijainti%3A%3A60.15968202058385%2C24.97222423553467?time=1660567140

  NO_TRANSIT_CONNECTION_IN_SEARCH_WINDOW
    fromPlace: "Rautatientori::60.170384,24.939846",
    toPlace: "Kabanovintie 631, Kirkkonummi::60.0706649887424,24.49556350708008", 
    date: "08-25-2022"
    time: "3:00am"

  WALKING_BETTER_THAN_TRANSIT
    /reitti/Rautatientori%2C%20Helsinki%3A%3A60.170384%2C24.939846/Keskuskatu%208%2C%20Helsinki%3A%3A60.1704933781611%2C24.94251072406769?time=1660567140

  OUTSIDE_BOUNDS 1
    fromPlace: "Rautatientori::60.170384,24.939846",
    toPlace: "Ei yhteyttä::60.528407,23.617172",
      
  OUTSIDE_BOUNDS 2
    fromPlace: "Ei yhteyttä::60.528407,23.617172",
    toPlace: "Rautatientori::60.170384,24.939846",

  OUTSIDE_BOUNDS 3
    fromPlace: "Ei yhteyttä::60.528407,23.617172",
    toPlace: "Ei yhteyttä B::60.528507,23.617272",

  OUTSIDE_SERVICE_PERIOD
    date: "2022-03-01"

  LOCATION_NOT_FOUND 1
    fromPlace: "Lempans::60.22924371006018,24.127006530761722",
    toPlace: "Rautatientori::60.170384,24.939846", 

  LOCATION_NOT_FOUND 2
    fromPlace: "Rautatientori::60.170384,24.939846", 
    toPlace: "Lempans::60.22924371006018,24.127006530761722",

  LOCATION_NOT_FOUND 3
    fromPlace: "Lempans::60.22924371006018,24.127006530761722",
    toPlace: "Lappers::60.20342859480837,24.039373397827152", 

  NO_STOPS_IN_RANGE 1
    fromPlace: "Lempans::60.22924371006018,24.127006530761722",
    toPlace: "Rautatientori::60.170384,24.939846",

  NO_STOPS_IN_RANGE 2
    fromPlace: "Rautatientori::60.170384,24.939846",
    toPlace: "Lappers::60.20342859480837,24.039373397827152",

  NO_STOPS_IN_RANGE 3
    fromPlace: "Lempans::60.22924371006018,24.127006530761722",
    toPlace: "Lappers::60.20342859480837,24.039373397827152", 
*/
