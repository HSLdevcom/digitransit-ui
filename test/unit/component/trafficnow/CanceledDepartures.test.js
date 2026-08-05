import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { shallowWithIntl } from '../../helpers/mock-intl-enzyme';
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
  headsign: 'Kamppi',
  canceledTrips,
});

describe('<CanceledDepartures />', () => {
  const departureTimes = wrapper =>
    wrapper.find('.routes-m-narrow').map(node => node.text().trim());

  const renderCanceledDepartures = props =>
    shallowWithIntl(
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

  it('splits departures per date and applies the limit per date', () => {
    const wrapper = renderCanceledDepartures();

    expect(
      wrapper.find('.badges__departure-group__date-group'),
    ).to.have.lengthOf(2);
    expect(departureTimes(wrapper)).to.deep.equal(['08:00', '09:00']);
  });

  it('shows a button when a date has more departures than the limit', () => {
    const wrapper = renderCanceledDepartures();
    const showAllButton = wrapper.find('.show-departures-button');

    expect(showAllButton).to.have.lengthOf(1);
  });

  it('shows all departures for the date when the button is clicked', () => {
    const wrapper = renderCanceledDepartures();

    wrapper.find('.show-departures-button').simulate('click');
    expect(departureTimes(wrapper)).to.deep.equal(['08:00', '08:05', '09:00']);
  });
});
