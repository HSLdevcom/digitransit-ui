import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import DepartureCancelationInfo from '../../../app/component/DepartureCancelationInfo';

describe('<DepartureCancelationInfo />', () => {
  it('should render', () => {
    const props = {
      routeMode: 'BUS',
      shortName: '52',
      headsign: 'Munkkivuori',
      scheduledDepartureTime: 1547630218,
    };
    const wrapper = mountWithIntl(<DepartureCancelationInfo {...props} />);
    expect(wrapper.text()).to.equal(
      'Bus 52 Munkkivuori: departure at 11:16 has been canceled',
    );
  });
});
