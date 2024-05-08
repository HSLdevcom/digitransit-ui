import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import CardHeader from '../../../app/component/CardHeader';
import ExternalLink from '../../../app/component/ExternalLink';
import AddressRow from '../../../app/component/AddressRow';

describe('<CardHeader />', () => {
  it('should render the header icon', () => {
    const props = {
      description: 'Ratapihantie',
      headerIcon: <div className="header-icon" />,
      name: 'Pasilan asema',
      stop: {},
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
      stop: {},
    };
    const wrapper = shallowWithIntl(<CardHeader {...props} />);
    const addressRow = wrapper.find(AddressRow);
    expect(addressRow.length).to.equal(1);
  });
  it('should  render the virtual monitor if so configured', () => {
    const props = {
      description: 'Ratapihantie',
      headerIcon: <div className="header-icon" />,
      name: 'Pasilan asema',
      code: '7528',
      network: 'citybike',
      externalLink: (
        <ExternalLink href="http://foo.com/virtualmonitor/HSL:1130181" />
      ),
      stop: {},
    };
    const wrapper = shallowWithIntl(<CardHeader {...props} />);
    expect(wrapper.find(ExternalLink)).to.have.lengthOf(1);
  });

  it('should not render the virtual monitor if its not passed', () => {
    const props = {
      description: 'Ratapihantie',
      headerIcon: <div className="header-icon" />,
      name: 'Pasilan asema',
      code: '7528',
      network: 'citybike',
      externalLink: null,
      stop: {},
    };
    const wrapper = shallowWithIntl(<CardHeader {...props} />);
    expect(wrapper.find(ExternalLink)).to.have.lengthOf(0);
  });
});
