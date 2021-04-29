import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

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

  it('should render in English', () => {
    const wrapper = mountWithIntl(
      <DepartureCancelationInfo {...defaultProps} />,
      {},
      'en',
    );

    expect(wrapper.text()).to.match(
      /Bus 52 Arabianranta–Munkkiniemi at [0-9]*:16 is cancelled/,
    );
  });

  it('should render in Finnish', () => {
    const wrapper = mountWithIntl(
      <DepartureCancelationInfo {...defaultProps} />,
      {},
      'fi',
    );
    expect(wrapper.text()).to.match(
      /Bussin 52 lähtö Arabianranta–Munkkiniemi kello [0-9]*:16 on peruttu/,
    );
  });

  it('should render in Swedish', () => {
    const wrapper = mountWithIntl(
      <DepartureCancelationInfo {...defaultProps} />,
      {},
      'sv',
    );
    expect(wrapper.text()).to.match(
      /Avgång på linje 52 Arabianranta–Munkkiniemi kl. [0-9]*:16 är inställd/,
    );
  });
});
