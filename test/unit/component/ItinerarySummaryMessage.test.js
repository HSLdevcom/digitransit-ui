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

const areaPolygon = [
  [18.776, 60.3316],
  [18.9625, 60.7385],
  [19.8615, 60.8957],
  [20.4145, 61.1942],
  [20.4349, 61.9592],
  [19.7853, 63.2157],
  [20.4727, 63.6319],
  [21.6353, 63.8559],
  [23.4626, 64.7794],
  [23.7244, 65.3008],
  [23.6873, 65.8569],
  [23.2069, 66.2701],
  [23.4627, 66.8344],
  [22.9291, 67.4662],
  [23.0459, 67.9229],
  [20.5459, 68.7605],
  [20.0996, 69.14],
  [21.426, 69.4835],
  [21.9928, 69.4009],
  [22.9226, 68.8678],
  [23.8108, 69.0145],
  [24.6903, 68.8614],
  [25.2262, 69.0596],
  [25.4029, 69.7235],
  [26.066, 70.0559],
  [28.2123, 70.2496],
  [29.5813, 69.7854],
  [29.8467, 69.49],
  [28.9502, 68.515],
  [30.4855, 67.6952],
  [29.4962, 66.9232],
  [30.5219, 65.8728],
  [30.1543, 64.9646],
  [30.9641, 64.1321],
  [30.572, 63.7098],
  [31.5491, 63.3309],
  [31.9773, 62.9304],
  [31.576, 62.426],
  [27.739, 60.1117],
  [26.0945, 59.8015],
  [22.4235, 59.3342],
  [20.2983, 59.2763],
  [19.3719, 59.6858],
  [18.7454, 60.1305],
  [18.776, 60.3316],
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
  areaPolygon,
  minDistanceBetweenFromAndTo: undefined,
  nationalServiceLink: {
    name: 'Matka',
    href: 'https://matka.fi',
  },
  from: {},
  to: {},
  searchTime: 123456780,
  currentTime: 1656580024206,
};

const matchFormattedMessage = msgId => enzymeWrapper =>
  enzymeWrapper.name() === 'FormattedMessage' &&
  enzymeWrapper.prop('id') === msgId;

/**
 * Test case creation helper.
 *
 * @param {Object.<String, any>} props `props` for `ItinerarySummaryMessage` component.
 * @param {String} messageId
 */
const expectFormattedMessage = (props, messageId) => {
  const wrapper = shallowWithIntl(<ItinerarySummaryMessage {...props} />, {
    context: mockContext,
    childContextTypes: mockChildContextTypes,
  });

  const assertErrorMessage = `<FormattedMessage id="${messageId}" .../> not found.`;
  expect(wrapper.findWhere(matchFormattedMessage(messageId))).to.have.length(
    1,
    assertErrorMessage,
  );
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
      expectFormattedMessage(
        {
          ...defaultProps,
          from: TestLocation.Outside,
          to: TestLocation.Rautatientori,
        },
        'use-national-service-prefix',
      );
    });

    it('renders message when origin out of bounds', () => {
      expectFormattedMessage(
        {
          ...defaultProps,
          from: TestLocation.Outside,
          to: TestLocation.Rautatientori,
          routingErrors: [
            { code: PlannerMessageType.OutsideBounds, inputField: 'FROM' },
          ],
        },
        'origin-outside-service',
      );
    });

    it('renders message when destination out of bounds', () => {
      expectFormattedMessage(
        {
          ...defaultProps,
          from: TestLocation.Rautatientori,
          to: TestLocation.Outside,
          routingErrors: [
            { code: PlannerMessageType.OutsideBounds, inputField: 'TO' },
          ],
        },
        'destination-outside-service',
      );
    });

    it('renders message when origin and destination out of bounds', () => {
      expectFormattedMessage(
        {
          ...defaultProps,
          from: TestLocation.Rautatientori,
          to: TestLocation.Outside,
          routingErrors: [
            { code: PlannerMessageType.OutsideBounds, inputField: 'TO' },
            { code: PlannerMessageType.OutsideBounds, inputField: 'FROM' },
          ],
        },
        'origin-and-destination-outside-service',
      );
    });

    it('renders message when: no stops near', () => {
      // NO_STOPS_IN_RANGE (lappers)
      // NO_STOPS_IN_RANGE (lappers)
    });

    it('renders message when: no stops near origin', () => {
      // NO_STOPS_IN_RANGE (lappers)
    });

    it('renders message when: no stops near destination', () => {
      // NO_STOPS_IN_RANGE (lappers)
    });

    it('renders message when: no transit connection', () => {});
    it('renders message when: no transit connection in search window', () => {});
    it('renders message when: walk only', () => {});

    it('renders message when: outside service period', () => {
      expectFormattedMessage(
        {
          ...defaultProps,
          currentTime: DATE_2022_01_01,
          searchTime: DATE_2022_01_01 + 180 * DAY,
          from: TestLocation.Rautatientori,
          to: TestLocation.Mannerheimintie_89,
          messageEnums: [PlannerMessageType.OutsideServicePeriod],
        },
        'outside-service-period',
      );
    });

    it('renders message when: serach time is in the past', () => {
      expectFormattedMessage(
        {
          ...defaultProps,
          currentTime: DATE_2022_01_01,
          searchTime: DATE_2022_01_01 - 2 * DAY,
          from: TestLocation.Rautatientori,
          to: TestLocation.Mannerheimintie_89,
          walking: true,
        },
        'itinerary-in-the-past-title',
      );
    });
  });
});

/*

NO_TRANSIT_CONNECTION
		http://localhost:8080/reitti/Valittu%20sijainti%3A%3A60.161908100606325%2C24.981869459152225/Valittu%20sijainti%3A%3A60.15968202058385%2C24.97222423553467?time=1660567140
NO_TRANSIT_CONNECTION_IN_SEARCH_WINDOW
    fromPlace: "Rautatientori::60.170384,24.939846",
  	toPlace: "Kabanovintie 631, Kirkkonummi::60.0706649887424,24.49556350708008", 
  	date: "08-25-2022"
  	time: "3:00am"
WALKING_BETTER_THAN_TRANSIT
	http://localhost:8080/reitti/Rautatientori%2C%20Helsinki%3A%3A60.170384%2C24.939846/Keskuskatu%208%2C%20Helsinki%3A%3A60.1704933781611%2C24.94251072406769?time=1660567140
OUTSIDE_BOUNDS 1
  	fromPlace: "Rautatientori::60.170384,24.939846",
    toPlace: "Ei yhteyttä::60.528407,23.617172",
  	date: "2022-08-25"
OUTSIDE_BOUNDS 2
    fromPlace: "Ei yhteyttä::60.528407,23.617172",
  	toPlace: "Rautatientori::60.170384,24.939846",
  	date: "2022-08-25"
OUTSIDE_BOUNDS 3
    fromPlace: "Ei yhteyttä::60.528407,23.617172",
  	toPlace: "Ei yhteyttä B::60.528507,23.617272",
  	date: "2022-08-25"
OUTSIDE_SERVICE_PERIOD
    fromPlace: "Matinkylä (M), Espoo::60.160047,24.739703",
  	toPlace: "Rautatientori::60.170384,24.939846",
  	date: "2022-03-01"
LOCATION_NOT_FOUND 1
    fromPlace: "Lempans::60.22924371006018,24.127006530761722",
  	toPlace: "Rautatientori::60.170384,24.939846", 
  	date: "08-25-2022"
LOCATION_NOT_FOUND 2
    toPlace: "Lempans::60.22924371006018,24.127006530761722",
  	fromPlace: "Rautatientori::60.170384,24.939846", 
  	date: "08-25-2022"
LOCATION_NOT_FOUND 3
    fromPlace: "Lempans::60.22924371006018,24.127006530761722",
  	toPlace: "Lappers::60.20342859480837,24.039373397827152", 
  	date: "08-25-2022"
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
