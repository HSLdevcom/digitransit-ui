import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../helpers/mock-providers';
import CanceledDepartures from '../../../../app/component/trafficnow/components/CanceledDepartures';

const makeCanceledTrip = (serviceDate, scheduledDeparture, gtfsId) => ({
  serviceDate,
  trip: {
    gtfsId,
    stoptimes: [{ scheduledDeparture }],
  },
});

const makePattern = canceledTrips => ({
  code: 'pattern-1',
  stops: [{ name: 'Eira' }, { name: 'Kamppi' }],
  headsign: 'Kamppi',
  canceledTrips,
});

describe('<CanceledDepartures />', () => {
  const renderCanceledDepartures = props => {
    const { container } = renderWithProviders(
      <CanceledDepartures
        departureLimit={1}
        patterns={[
          makePattern([
            makeCanceledTrip('2026-01-01', 28800, 'trip-1'),
            makeCanceledTrip('2026-01-01', 29100, 'trip-2'),
            makeCanceledTrip('2026-01-02', 32400, 'trip-3'),
          ]),
        ]}
        {...props}
      />,
    );
    return container;
  };

  it('splits departures per date and applies the limit per date', () => {
    const container = renderCanceledDepartures();
    expect(
      container.querySelectorAll('.badges__departure-group__date-group'),
    ).to.have.lengthOf(2);
    const times = [...container.querySelectorAll('.routes-m-narrow')].map(n =>
      n.textContent.trim(),
    );
    expect(times).to.deep.equal(['08:00', '09:00']);
  });

  it('shows a button when a date has more departures than the limit', () => {
    const container = renderCanceledDepartures();
    expect(
      container.querySelectorAll('.show-departures-button'),
    ).to.have.lengthOf(1);
  });

  it('shows all departures for the date when the button is clicked', () => {
    const container = renderCanceledDepartures();
    fireEvent.click(container.querySelector('.show-departures-button'));
    const times = [...container.querySelectorAll('.routes-m-narrow')].map(n =>
      n.textContent.trim(),
    );
    expect(times).to.deep.equal(['08:00', '08:05', '09:00']);
  });
});
