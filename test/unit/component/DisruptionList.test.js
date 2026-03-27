import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import DisruptionList, {
  EmptyDisruptions,
} from '../../../app/component/DisruptionList';
import Disruption from '../../../app/component/Disruption';
import { AlertEntityType } from '../../../utils/shared/constants';

describe('<DisruptionList />', () => {
  it('should show a "no alerts" message', () => {
    const props = {
      cancelations: [],
      serviceAlerts: [],
    };
    const wrapper = shallowWithIntl(<DisruptionList {...props} />, {
      currentTime: 1547464412,
    });
    expect(wrapper.find(EmptyDisruptions)).to.have.lengthOf(1);
  });

  it('should order the cancelations and service alerts by route shortName and put alerts first', () => {
    const props = {
      cancelations: [
        {
          id: 'cancel-3',
          alertHeaderText: 'third',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          effectiveEndDate: 1547464420,
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
          id: 'cancel-4',
          alertHeaderText: 'fourth',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          effectiveEndDate: 1547464420,
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
          id: 'alert-2',
          alertHeaderText: 'second',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          effectiveEndDate: 1547464420,
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
          id: 'alert-1',
          alertHeaderText: 'first',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 1547464413,
          effectiveEndDate: 1547464420,
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
    const wrapper = shallowWithIntl(<DisruptionList {...props} />, {
      currentTime: 1547464414,
    });
    expect(wrapper.find(Disruption).at(0).prop('alertHeaderText')).to.equal(
      'first',
    );
    expect(wrapper.find(Disruption).at(1).prop('alertHeaderText')).to.equal(
      'second',
    );
    expect(wrapper.find(Disruption).at(2).prop('alertHeaderText')).to.equal(
      'third',
    );
    expect(wrapper.find(Disruption).at(3).prop('alertHeaderText')).to.equal(
      'fourth',
    );
  });

  it('should not display past service alerts', () => {
    const props = {
      cancelations: [],
      serviceAlerts: [
        {
          id: 'alert',
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
    const wrapper = shallowWithIntl(<DisruptionList {...props} />, {
      currentTime: 100,
    });
    expect(wrapper.find(EmptyDisruptions)).to.have.lengthOf(1);
  });

  it('should display current cancelations and service alerts', () => {
    const props = {
      cancelations: [
        {
          id: 'cancelation',
          alertHeaderText: 'cancelation',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 50,
          effectiveEndDate: 150,
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
          id: 'servicealert',
          alertHeaderText: 'servicealert',
          alertSeverityLevel: 'SEVERE',
          effectiveStartDate: 50,
          effectiveEndDate: 150,
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
    const wrapper = shallowWithIntl(<DisruptionList {...props} />, {
      currentTime: 100,
    });
    expect(wrapper.find(Disruption)).to.have.lengthOf(2);
  });

  it('should display future service alerts under the upcoming section', () => {
    const props = {
      serviceAlerts: [
        {
          id: 'servicealert',
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
    const wrapper = shallowWithIntl(<DisruptionList {...props} />, {
      currentTime: 100,
    });
    expect(wrapper.find(Disruption)).to.have.lengthOf(1);
    expect(wrapper.find(EmptyDisruptions)).to.have.lengthOf(0);
  });
});
