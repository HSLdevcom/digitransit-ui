import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import IconWithBigCaution from '../../../app/component/IconWithBigCaution';
import IconWithIcon from '../../../app/component/IconWithIcon';
import RouteNumber from '../../../app/component/RouteNumber';

describe('<RouteNumber />', () => {
  it('should use an icon based on the mode', () => {
    const props = {
      mode: 'CITYBIKE',
    };
    const wrapper = shallowWithIntl(<RouteNumber {...props} />);
    expect(wrapper.find(IconWithIcon).prop('img')).to.equal(
      'icon-icon_citybike',
    );
  });

  it('should use the given icon', () => {
    const props = {
      icon: 'icon-icon_scooter',
      mode: 'CITYBIKE',
    };
    const wrapper = shallowWithIntl(<RouteNumber {...props} />);
    expect(wrapper.find(IconWithIcon).prop('img')).to.equal(
      'icon-icon_scooter',
    );
  });

  it('should use the given icon when there is a disruption', () => {
    const props = {
      hasDisruption: true,
      icon: 'icon-icon_scooter',
      mode: 'CITYBIKE',
    };
    const wrapper = shallowWithIntl(<RouteNumber {...props} />);
    expect(wrapper.find(IconWithBigCaution).prop('img')).to.equal(
      'icon-icon_scooter',
    );
  });

  it('should use the given icon when there is a call agency', () => {
    const props = {
      icon: 'icon-icon_scooter',
      isCallAgency: true,
      mode: 'CITYBIKE',
    };
    const wrapper = shallowWithIntl(<RouteNumber {...props} />);
    expect(wrapper.find(IconWithIcon).prop('img')).to.equal(
      'icon-icon_scooter',
    );
  });
});
