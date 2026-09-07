import React from 'react';

import { mockContext } from '../helpers/mock-context';
import { renderWithProviders } from '../helpers/mock-providers';
import translations from '../../../app/translations/en';
import { Component as NoItinerariesNote } from '../../../app/component/itinerary/NoItinerariesNote';
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

mockContext.config = {
  ...mockContext.config,
  areaPolygon: HelsinkiRegionBounds,
  minDistanceBetweenFromAndTo: 100.0,
  nationalServiceLink: {
    fi: {
      name: 'matka.fintraffic.fi',
      href: 'https://matka.fintraffic.fi/',
    },
    sv: {
      name: 'matka.fintraffic.fi',
      href: 'https://matka.fintraffic.fi/sv/',
    },
    en: {
      name: 'matka.fintraffic.fi',
      href: 'https://matka.fintraffic.fi/en/',
    },
  },
};

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
  from: {},
  to: {},
  searchTime: 123456780,
  currentTime: 1656580024206,
};

const renderNote = props =>
  renderWithProviders(<NoItinerariesNote {...props} />, {
    config: mockContext.config,
    match: mockContext.match,
  });

const expectMessage = (props, messageId) => {
  const { container } = renderNote(props);
  expect(container.querySelector('.summary-no-route-found')).to.not.equal(null);
  expect(container.textContent).to.contain(translations.en[messageId]);
};

const expectLink = (props, linkClass) => {
  const { container } = renderNote(props);
  expect(container.querySelector(`a.${linkClass}`)).to.not.equal(null);
};

describe('<NoItinerariesNote />', () => {
  it('should render without crashing', () => {
    const { container } = renderNote(defaultProps);
    expect(container.querySelector('.summary-no-route-found')).to.not.equal(
      null,
    );
  });

  describe('error messages', () => {
    const DAY = 24 * 3600 * 1000;

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
      expectLink(props, 'no-decoration');
    });

    it('renders message when origin out of bounds', () => {
      expectMessage(
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
      expectMessage(
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
      expectMessage(
        {
          ...defaultProps,
          from: TestLocation.Outside,
          to: TestLocation.Outside,
          routingErrors: [
            { code: PlannerMessageType.OutsideBounds, inputField: 'TO' },
            { code: PlannerMessageType.OutsideBounds, inputField: 'FROM' },
          ],
        },
        'router-outside-bounds-3',
      );
    });

    it('renders message when: outside service period', () => {
      expectMessage(
        {
          ...defaultProps,
          searchTime: Date.now() + 180 * DAY,
          from: TestLocation.Rautatientori,
          to: TestLocation.Mannerheimintie_89,
          routingErrors: [
            {
              code: PlannerMessageType.OutsideServicePeriod,
              inputField: 'DATE_TIME',
            },
          ],
        },
        'router-outside-service-period',
      );
    });

    it('renders an action link when: outside service period', () => {
      expectLink(
        {
          ...defaultProps,
          searchTime: Date.now() + 180 * DAY,
          from: TestLocation.Rautatientori,
          to: TestLocation.Mannerheimintie_89,
          routingErrors: [
            {
              code: PlannerMessageType.OutsideServicePeriod,
              inputField: 'DATE_TIME',
            },
          ],
        },
        'no-decoration',
      );
    });

    it('renders message when: search time is in the past', () => {
      expectMessage(
        {
          ...defaultProps,
          searchTime: Date.now() - 2 * DAY,
          from: TestLocation.Rautatientori,
          to: TestLocation.Mannerheimintie_89,
          walking: true,
        },
        'itinerary-in-the-past',
      );
    });
  });
});
