import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import sinon from 'sinon';

import { renderWithProviders } from '../helpers/mock-providers';
import Disruption from '../../../app/component/Disruption';
import { AlertEntityType } from '../../../utils/shared/constants';
import {
  routePagePath,
  PREFIX_STOPS,
  PREFIX_TERMINALS,
  PREFIX_DISRUPTION,
} from '../../../utils/shared/path';

const baseConfig = {
  CONFIG: 'default',
  colors: { primary: '#007ac9' },
};

const routeEntity = (overrides = {}) => ({
  __typename: AlertEntityType.Route,
  mode: 'BUS',
  shortName: '97N',
  gtfsId: 'HSL:2097N',
  code: '2097N_20240101_1',
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

const renderDisruption = props =>
  renderWithProviders(<Disruption {...props} />, { config: baseConfig })
    .container;

describe('<Disruption />', () => {
  it('should return null when both alertDescriptionText and alertHeaderText are missing', () => {
    const container = renderDisruption({
      id: 'alert-null',
      entities: [routeEntity()],
    });
    expect(container.querySelectorAll('.alert-row')).to.have.lengthOf(0);
  });

  it('should render alert-row when alertHeaderText is provided', () => {
    const container = renderDisruption({
      id: 'alert-row',
      alertHeaderText: 'Service alert',
      alertSeverityLevel: 'WARNING',
      entities: [routeEntity()],
    });
    expect(container.querySelectorAll('.alert-row')).to.have.lengthOf(1);
  });

  it('should render toggle button when toggleDetails is provided', () => {
    const container = renderDisruption({
      alertHeaderText: 'Alert',
      alertSeverityLevel: 'WARNING',
      id: 'alert-1',
      toggleDetails: sinon.spy(),
      entities: [routeEntity()],
    });
    expect(container.querySelectorAll('.alert-row-arrow')).to.have.lengthOf(1);
  });

  it('should render link to the timetablepage for cancelations', () => {
    const container = renderDisruption({
      id: 'cancelation-1',
      alertHeaderText: 'Cancelation',
      alertSeverityLevel: 'WARNING',
      toggleDetails: sinon.spy(),
      canceledDepartures: [{ scheduledDeparture: 36000 }],
      entities: [routeEntity()],
    });
    expect(container.querySelectorAll('.alert-row-arrow')).to.have.lengthOf(1);
  });

  it('should render DisruptionBadge with correct severity and effect', () => {
    const container = renderDisruption({
      id: 'badge-1',
      alertHeaderText: 'Alert',
      alertSeverityLevel: 'WARNING',
      alertEffect: 'REDUCED_SERVICE',
      entities: [routeEntity()],
    });
    const badge = container.querySelector('.badge.warning');
    expect(badge).to.not.equal(null);
    expect(badge.textContent).to.equal('Reduced routes');
  });

  it('should render mode icon and link for route entity', () => {
    const container = renderDisruption({
      id: 'route-link-1',
      alertHeaderText: 'Alert',
      alertSeverityLevel: 'WARNING',
      entities: [routeEntity()],
    });
    expect(container.querySelectorAll('svg.icon.bus')).to.have.lengthOf(1);
    const link = container.querySelector('.mode-badge');
    expect(link).to.not.equal(null);
    expect(link.getAttribute('href')).to.equal(
      routePagePath('HSL:2097N', PREFIX_DISRUPTION, '2097N_20240101_1'),
    );
    expect(link.querySelector('span').textContent).to.equal('97N');
  });

  it('should render stop link with PREFIX_STOPS for non-station stop', () => {
    const container = renderDisruption({
      id: 'stop-link-1',
      alertHeaderText: 'Alert',
      alertSeverityLevel: 'WARNING',
      entities: [stopEntity()],
    });
    const link = container.querySelector('.mode-badge');
    expect(link).to.not.equal(null);
    expect(link.getAttribute('href')).to.equal(
      `/${PREFIX_STOPS}/${encodeURIComponent('HSL:1234')}`,
    );
    expect(link.querySelector('span').textContent).to.equal('Test Stop');
  });

  it('should render terminal link for station stop', () => {
    const container = renderDisruption({
      id: 'terminal-link-1',
      alertHeaderText: 'Alert',
      alertSeverityLevel: 'WARNING',
      entities: [stopEntity({ locationType: 'STATION', gtfsId: 'HSL:5678' })],
    });
    const link = container.querySelector('.mode-badge');
    expect(link.getAttribute('href')).to.equal(
      `/${PREFIX_TERMINALS}/${encodeURIComponent('HSL:5678')}`,
    );
  });

  it('should render alertHeaderText in alert-row-bottom', () => {
    const container = renderDisruption({
      id: 'header-text-1',
      alertHeaderText: 'Detour on route 97N',
      alertSeverityLevel: 'WARNING',
      entities: [routeEntity()],
    });
    expect(container.querySelector('.alert-row-title').textContent).to.equal(
      'Detour on route 97N',
    );
  });

  it('should render canceled departure times', () => {
    const container = renderDisruption({
      id: 'cancelation-times-1',
      alertHeaderText: 'Cancelation',
      alertSeverityLevel: 'WARNING',
      canceledDepartures: [
        { scheduledDeparture: 36000 },
        { scheduledDeparture: 39600 },
      ],
      entities: [routeEntity()],
    });
    expect(container.querySelectorAll('.canceled-departures')).to.have.lengthOf(
      1,
    );
    const badges = container.querySelectorAll('.cancelation-badge');
    expect(badges).to.have.lengthOf(2);
    expect(badges[0].querySelector('.canceled').textContent).to.equal('10:00');
    expect(badges[1].querySelector('.canceled').textContent).to.equal('11:00');
  });

  it('should group entities of same type and mode under one icon', () => {
    const container = renderDisruption({
      id: 'grouped-entities-1',
      alertHeaderText: 'Alert',
      alertSeverityLevel: 'WARNING',
      entities: [
        routeEntity({ gtfsId: 'HSL:1001', shortName: '1', id: 'r1' }),
        routeEntity({ gtfsId: 'HSL:1002', shortName: '2', id: 'r2' }),
      ],
    });
    expect(container.querySelectorAll('svg.icon.bus')).to.have.lengthOf(1);
    expect(container.querySelectorAll('.mode-badge')).to.have.lengthOf(2);
  });
});
