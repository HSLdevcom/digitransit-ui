import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as RouteAlertsContainer } from '../../../app/component/RouteAlertsContainer';
import RouteAlertsRow from '../../../app/component/RouteAlertsRow';

describe('<RouteAlertsContainer />', () => {
  it('should indicate that there are no alerts if the alerts array is empty', () => {
    const props = {
      route: {
        alerts: [],
      },
    };
    const wrapper = shallowWithIntl(<RouteAlertsContainer {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('.no-alerts-message')).to.have.lengthOf(1);
  });

  it('should indicate that there are no alerts if the alerts array does not have an alert for the current patternId', () => {
    const props = {
      patternId: 'HSL:1063:0:01',
      route: {
        mode: 'BUS',
        alerts: [
          {
            trip: {
              pattern: {
                code: 'HSL:1063:1:01',
              },
            },
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<RouteAlertsContainer {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('.no-alerts-message')).to.have.lengthOf(1);
  });

  it('should render an alert if the patternIds match', () => {
    const props = {
      patternId: 'HSL:4335:0:01',
      route: {
        alerts: [
          {
            alertHeaderText: null,
            alertHeaderTextTranslations: [],
            alertDescriptionText:
              'Vantaan sisäisen liikenteen linja 335 Linnaisista, klo 11:59 peruttu. Syy: tilapäinen häiriö.',
            alertDescriptionTextTranslations: [
              {
                text:
                  'Vantaan sisäisen liikenteen linja 335 Linnaisista, klo 11:59 peruttu. Syy: tilapäinen häiriö.',
                language: 'fi',
              },
              {
                text:
                  'Vanda lokaltrafik, linje 335 från Linnais, kl. 11:59 inställd. Orsak: tillfällig störning.',
                language: 'sv',
              },
              {
                text:
                  'Vantaa local traffic, line 335 from Linnainen, 11:59 cancelled. Cause: temporary disruption.',
                language: 'en',
              },
            ],
            id: 'testAlert',
            trip: {
              pattern: {
                code: 'HSL:4335:0:01',
              },
            },
          },
        ],
        color: null,
        mode: 'BUS',
        shortName: '335',
      },
    };
    const wrapper = shallowWithIntl(<RouteAlertsContainer {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find(RouteAlertsRow)).to.have.lengthOf(1);
  });
});
