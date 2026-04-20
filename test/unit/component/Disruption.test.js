import React from 'react';
import sinon from 'sinon';
import * as found from 'found';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import Icon from '../../../app/component/Icon';
import Badge from '../../../app/component/Badge';
import Disruption from '../../../app/component/Disruption';
import { AlertEntityType } from '../../../app/constants';
import {
  routePagePath,
  PREFIX_STOPS,
  PREFIX_TERMINALS,
} from '../../../app/util/path';
import { mockContext } from '../helpers/mock-context';
import * as ConfigContext from '../../../app/configurations/ConfigContext';

const routeEntity = (overrides = {}) => ({
  __typename: AlertEntityType.Route,
  mode: 'BUS',
  shortName: '97N',
  gtfsId: 'HSL:2097N',
  id: 'route-1',
  ...overrides,
});

const stopEntity = (overrides = {}) => ({
  __typename: AlertEntityType.Stop,
  vehicleMode: 'BUS',
  name: 'Test Stop',
  gtfsId: 'HSL:1234',
  id: 'stop-1',
  locationType: 'STOP',
  ...overrides,
});

describe('<Disruption />', () => {
  beforeEach(() => {
    sinon.stub(ConfigContext, 'useConfigContext').returns(mockContext.config);
    sinon
      .stub(found, 'useRouter')
      .returns({ match: mockContext.match, router: mockContext.router });
  });

  afterEach(() => {
    ConfigContext.useConfigContext.restore();
    found.useRouter.restore();
  });

  it('should return null when both alertDescriptionText and alertHeaderText are missing', () => {
    const props = {
      id: 'alert-null',
      entities: [routeEntity()],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find('.alert-row')).to.have.lengthOf(0);
  });

  it('should render alert-row when alertHeaderText is provided', () => {
    const props = {
      id: 'alert-row',
      alertHeaderText: 'Service alert',
      alertSeverityLevel: 'WARNING',
      entities: [routeEntity()],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find('.alert-row')).to.have.lengthOf(1);
  });

  it('should render toggle button when toggleDetails is provided and not a cancelation', () => {
    const toggleDetails = sinon.spy();
    const props = {
      alertHeaderText: 'Alert',
      alertSeverityLevel: 'WARNING',
      id: 'alert-1',
      toggleDetails,
      entities: [routeEntity()],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    const button = wrapper.find('.alert-row-arrow');
    expect(button).to.have.lengthOf(1);
    button.simulate('click');
    expect(toggleDetails.calledWith('alert-1')).to.equal(true);
  });

  it('should not render toggle button for cancelations', () => {
    const props = {
      id: 'cancelation-1',
      alertHeaderText: 'Cancelation',
      alertSeverityLevel: 'WARNING',
      toggleDetails: sinon.spy(),
      canceledDepartures: [{ scheduledDeparture: 36000 }],
      entities: [routeEntity()],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find('.alert-row-arrow')).to.have.lengthOf(0);
  });

  it('should render Badge with correct severity and effect', () => {
    const props = {
      id: 'badge-1',
      alertHeaderText: 'Alert',
      alertSeverityLevel: 'WARNING',
      alertEffect: 'REDUCED_SERVICE',
      entities: [routeEntity()],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    const badge = wrapper.find(Badge);
    expect(badge).to.have.lengthOf(1);
    expect(badge.prop('variant')).to.equal('WARNING');
    expect(badge.prop('label')).to.equal('REDUCED_SERVICE');
  });

  it('should render mode icon and link for route entity', () => {
    const props = {
      id: 'route-link-1',
      alertHeaderText: 'Alert',
      alertSeverityLevel: 'WARNING',
      entities: [routeEntity()],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    expect(
      wrapper.find(Icon).findWhere(n => n.prop('className') === 'bus'),
    ).to.have.lengthOf(1);
    const link = wrapper.find('.mode-badge a');
    expect(link).to.have.lengthOf(1);
    expect(link.prop('href')).to.equal(routePagePath('HSL:2097N'));
    expect(link.find('span').text()).to.equal('97N');
  });

  it('should render stop link with PREFIX_STOPS for non-station stop', () => {
    const props = {
      id: 'stop-link-1',
      alertHeaderText: 'Alert',
      alertSeverityLevel: 'WARNING',
      entities: [stopEntity()],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    const link = wrapper.find('.mode-badge a');
    expect(link).to.have.lengthOf(1);
    expect(link.prop('href')).to.equal(
      `/${PREFIX_STOPS}/${encodeURIComponent('HSL:1234')}`,
    );
    expect(link.find('span').text()).to.equal('Test Stop');
  });

  it('should render terminal link for station stop', () => {
    const props = {
      id: 'terminal-link-1',
      alertHeaderText: 'Alert',
      alertSeverityLevel: 'WARNING',
      entities: [stopEntity({ locationType: 'STATION', gtfsId: 'HSL:5678' })],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    const link = wrapper.find('.mode-badge a');
    expect(link.prop('href')).to.equal(
      `/${PREFIX_TERMINALS}/${encodeURIComponent('HSL:5678')}`,
    );
  });

  it('should render alertHeaderText in alert-row-bottom', () => {
    const props = {
      id: 'header-text-1',
      alertHeaderText: 'Detour on route 97N',
      alertSeverityLevel: 'WARNING',
      entities: [routeEntity()],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find('.alert-row-title').text()).to.equal(
      'Detour on route 97N',
    );
  });

  it('should render canceled departure times', () => {
    const props = {
      id: 'cancelation-times-1',
      alertHeaderText: 'Cancelation',
      alertSeverityLevel: 'WARNING',
      canceledDepartures: [
        { scheduledDeparture: 36000 },
        { scheduledDeparture: 39600 },
      ],
      entities: [routeEntity()],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find('.canceled-departures')).to.have.lengthOf(1);
    const badges = wrapper.find('.cancelation-badge');
    expect(badges).to.have.lengthOf(2);
    expect(badges.at(0).find('.canceled').text()).to.equal('10:00');
    expect(badges.at(1).find('.canceled').text()).to.equal('11:00');
  });

  it('should group entities of same type and mode under one icon', () => {
    const props = {
      id: 'grouped-entities-1',
      alertHeaderText: 'Alert',
      alertSeverityLevel: 'WARNING',
      entities: [
        routeEntity({ gtfsId: 'HSL:1001', shortName: '1', id: 'r1' }),
        routeEntity({ gtfsId: 'HSL:1002', shortName: '2', id: 'r2' }),
      ],
    };
    const wrapper = shallowWithIntl(<Disruption {...props} />, {
      context: mockContext,
    });
    expect(
      wrapper.find(Icon).findWhere(n => n.prop('className') === 'bus'),
    ).to.have.lengthOf(1);
    expect(wrapper.find('.mode-badge')).to.have.lengthOf(2);
  });
});
