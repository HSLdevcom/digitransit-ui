import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import LocalTime from '../../../app/component/LocalTime';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import DepartureCancelationInfo from '../../../app/component/DepartureCancelationInfo';

describe('<DepartureCancelationInfo />', () => {
  const defaultProps = {
    routeMode: 'BUS',
    shortName: '52',
    firstStopName: 'Arabianranta',
    headsign: 'Munkkiniemi',
    scheduledDepartureTime: 1547630218,
  };

  // because the local time of the epoch second is different depending on your timezone, we have to localise it too
  // before running the asserts
  const localTimeInCurrentTimezone = LocalTime({
    forceUtc: false,
    time: defaultProps.scheduledDepartureTime,
  });

  it('should render in English', () => {
    const wrapper = mountWithIntl(
      <DepartureCancelationInfo {...defaultProps} />,
      {},
      'en',
    );
    expect(localTimeInCurrentTimezone).to.contain('16');
    expect(wrapper.text()).to.equal(
      `Bus 52 Arabianranta–Munkkiniemi at ${localTimeInCurrentTimezone} is cancelled`,
    );
  });

  it('should render in Finnish', () => {
    const wrapper = mountWithIntl(
      <DepartureCancelationInfo {...defaultProps} />,
      {},
      'fi',
    );
    expect(wrapper.text()).to.equal(
      `Bussin 52 lähtö Arabianranta–Munkkiniemi kello ${localTimeInCurrentTimezone} on peruttu`,
    );
  });

  it('should render in Swedish', () => {
    const wrapper = mountWithIntl(
      <DepartureCancelationInfo {...defaultProps} />,
      {},
      'sv',
    );
    expect(wrapper.text()).to.equal(
      `Avgång på linje 52 Arabianranta–Munkkiniemi kl. ${localTimeInCurrentTimezone} är inställd`,
    );
  });
});
