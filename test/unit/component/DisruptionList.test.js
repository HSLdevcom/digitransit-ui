import React from 'react';
import sinon from 'sinon';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import {
  Component as DisruptionList,
  EmptyDisruptions,
} from '../../../app/component/DisruptionList';
import Disruption from '../../../app/component/Disruption';
import { AlertEntityType } from '../../../app/constants';
import * as withBreakpoint from '../../../app/util/withBreakpoint';
import { mockMatch } from '../helpers/mock-router';

const routeEntity = (overrides = {}) => ({
  __typename: AlertEntityType.Route,
  mode: 'BUS',
  shortName: '63',
  gtfsId: 'HSL:1063',
  ...overrides,
});

const makeAlert = (overrides = {}) => ({
  id: 'alert-1',
  alertHeaderText: 'Test alert',
  alertSeverityLevel: 'WARNING',
  alertHash: Math.random(),
  entities: [routeEntity()],
  ...overrides,
});

describe('<DisruptionList />', () => {
  beforeEach(() => {
    sinon.stub(withBreakpoint, 'useBreakpoint').returns('small');
  });

  afterEach(() => {
    withBreakpoint.useBreakpoint.restore();
  });

  it('should show EmptyDisruptions when there are no alerts or cancelations', () => {
    const props = {
      currentTime: 1000,
      cancelations: [],
      serviceAlerts: [],
    };
    const wrapper = shallowWithIntl(<DisruptionList {...props} />);
    expect(wrapper.find(EmptyDisruptions)).to.have.lengthOf(1);
  });

  it('should render current service alerts in the active section', () => {
    const props = {
      currentTime: 500,
      cancelations: [],
      serviceAlerts: [
        makeAlert({
          id: 'a1',
          effectiveStartDate: 100,
          effectiveEndDate: 900,
        }),
      ],
    };
    const wrapper = shallowWithIntl(<DisruptionList {...props} />);
    const disruptions = wrapper.find(Disruption);
    expect(disruptions).to.have.lengthOf(1);
    expect(disruptions.at(0).prop('alertHeaderText')).to.equal('Test alert');
  });

  it('should render future service alerts in the upcoming section', () => {
    const props = {
      currentTime: 50,
      cancelations: [],
      serviceAlerts: [
        makeAlert({
          id: 'a1',
          effectiveStartDate: 100,
          effectiveEndDate: 900,
        }),
      ],
    };
    const wrapper = shallowWithIntl(<DisruptionList {...props} />);
    const disruptions = wrapper.find(Disruption);
    expect(disruptions).to.have.lengthOf(1);
    expect(disruptions.at(0).prop('alertHeaderText')).to.equal('Test alert');
  });

  it('should show valid cancelations as Disruptions', () => {
    const props = {
      currentTime: 500,
      cancelations: [
        makeAlert({
          id: 'c1',
          alertHeaderText: 'Cancelation',
          effectiveStartDate: 100,
          effectiveEndDate: 900,
        }),
      ],
      serviceAlerts: [],
    };
    const wrapper = shallowWithIntl(<DisruptionList {...props} />);
    const disruptions = wrapper.find(Disruption);
    expect(disruptions).to.have.lengthOf(1);
    expect(disruptions.at(0).prop('alertHeaderText')).to.equal('Cancelation');
  });

  it('should render DisruptionDetails when alertId query param matches', () => {
    const matchWithAlertId = {
      ...mockMatch,
      location: {
        ...mockMatch.location,
        query: { alertId: 'a1' },
      },
    };

    const props = {
      currentTime: 500,
      cancelations: [],
      serviceAlerts: [
        makeAlert({
          id: 'a1',
          alertHeaderText: 'Detail view',
          alertDescriptionText: 'Full description',
          alertSeverityLevel: 'WARNING',
          effectiveStartDate: 100,
          effectiveEndDate: 900,
        }),
      ],
    };
    const wrapper = shallowWithIntl(<DisruptionList {...props} />, {
      match: matchWithAlertId,
    });
    expect(wrapper.find(Disruption)).to.have.lengthOf(0);
    expect(wrapper.find(EmptyDisruptions)).to.have.lengthOf(0);
    expect(wrapper.find('.alerts-content-wrapper')).to.have.lengthOf(0);
  });

  it('should pass toggleDetails function to Disruption children', () => {
    const props = {
      currentTime: 500,
      cancelations: [],
      serviceAlerts: [
        makeAlert({
          id: 'a1',
          effectiveStartDate: 100,
          effectiveEndDate: 900,
        }),
      ],
    };
    const wrapper = shallowWithIntl(<DisruptionList {...props} />);
    const disruption = wrapper.find(Disruption).at(0);
    expect(disruption.prop('toggleDetails')).to.be.a('function');
  });
});
