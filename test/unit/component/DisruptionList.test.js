import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as DisruptionList } from '../../../app/component/DisruptionList';
import Disruption from '../../../app/component/Disruption';
import { AlertEntityType } from '../../../app/constants';

describe('<DisruptionList />', () => {
  it('should show a "no alerts" message', () => {
    const props = {
      currentTime: 1547464412,
      cancelations: [],
      serviceAlerts: [],
    };
    const wrapper = shallowWithIntl(<DisruptionList {...props} />);
    expect(wrapper.find('.no-alerts-container')).to.have.lengthOf(1);
  });

  it('should order the cancelations and service alerts by route shortName and put alerts first', () => {
    const props = {
      currentTime: 1547464414,
      cancelations: [
        {
          alertHeaderText: 'third',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'BUS',
              shortName: '37N',
              gtfsId: 'foo:2037N',
            },
          ],
        },
        {
          alertHeaderText: 'fourth',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'RAIL',
              shortName: 'A',
              gtfsId: 'foo:2000A',
            },
          ],
        },
      ],
      serviceAlerts: [
        {
          alertHeaderText: 'second',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'BUS',
              shortName: '138',
              gtfsId: 'foo:138',
            },
          ],
        },
        {
          alertHeaderText: 'first',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'TRAM',
              shortName: '8A',
              gtfsId: 'foo:8A',
            },
          ],
        },
      ],
    };
    const wrapper = shallowWithIntl(<DisruptionList {...props} />);
    expect(wrapper.find(Disruption).at(0).prop('header')).to.equal('first');
    expect(wrapper.find(Disruption).at(1).prop('header')).to.equal('second');
    expect(wrapper.find(Disruption).at(2).prop('header')).to.equal('third');
    expect(wrapper.find(Disruption).at(3).prop('header')).to.equal('fourth');
  });

  it('should not display past service alerts', () => {
    const props = {
      currentTime: 100,
      cancelations: [],
      serviceAlerts: [
        {
          alertHeaderText: 'alert',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1,
          effectiveEndDate: 99,
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'TRAM',
              shortName: '8A',
              gtfsId: 'foo:8A',
            },
          ],
        },
      ],
    };
    const wrapper = shallowWithIntl(<DisruptionList {...props} />);
    expect(wrapper.find('.no-alerts-container')).to.have.lengthOf(1);
  });

  it('should display current cancelations and service alerts', () => {
    const props = {
      currentTime: 100,
      cancelations: [
        {
          alertHeaderText: 'cancelation',
          alertSeverityLevel: 'SEVERE',
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'TRAM',
              shortName: '8A',
              gtfsId: 'foo:8A',
            },
          ],
        },
      ],
      serviceAlerts: [
        {
          alertHeaderText: 'servicealert',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 100,
          effectiveEndDate: 100,
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'TRAM',
              shortName: '8A',
              gtfsId: 'foo:8A',
            },
          ],
        },
      ],
    };
    const wrapper = shallowWithIntl(<DisruptionList {...props} />);
    expect(wrapper.find(Disruption)).to.have.lengthOf(2);
  });

  it('should not display future service alerts', () => {
    const props = {
      currentTime: 100,
      serviceAlerts: [
        {
          alertHeaderText: 'servicealert',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 101,
          effectiveEndDate: 200,
          feed: 'foo',
          entities: [
            {
              __typename: AlertEntityType.Route,
              mode: 'TRAM',
              shortName: '8A',
              gtfsId: 'foo:8A',
            },
          ],
        },
      ],
    };
    const wrapper = shallowWithIntl(<DisruptionList {...props} />);
    expect(wrapper.find('.no-alerts-container')).to.have.lengthOf(1);
  });
});
