import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import CardHeader from '../../../app/component/CardHeader';

describe('<CardHeader />', () => {
  it('should render the header icon', () => {
    const props = {
      description: 'Ratapihantie',
      headerIcon: <div className="header-icon" />,
      name: 'Pasilan asema',
    };
    const wrapper = shallowWithIntl(<CardHeader {...props} />);
    expect(wrapper.find('.header-icon')).to.have.lengthOf(1);
  });
  it('should render the station code', () => {
    const props = {
      description: 'Ratapihantie',
      headerIcon: <div className="header-icon" />,
      name: 'Pasilan asema',
      code: '7528',
      network: 'citybike',
    };
    const wrapper = shallowWithIntl(<CardHeader {...props} />);
    expect(wrapper.find('.card-code').text()).to.equal('7528');
  });
});
