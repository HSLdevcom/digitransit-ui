import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { AlertSeverityLevelType } from '../../../app/constants';
import FavouritesTabLabel from '../../../app/component/FavouritesTabLabel';
import Icon from '../../../app/component/Icon';
import IconWithCaution from '../../../app/component/IconWithCaution';

describe('<FavouritesTabLabel />', () => {
  it('should use the caution icon with an alertSeverityLevel', () => {
    const props = {
      alertSeverityLevel: AlertSeverityLevelType.Warning,
      classes: '',
      onClick: () => {},
    };
    const wrapper = shallowWithIntl(<FavouritesTabLabel {...props} />);
    expect(wrapper.find(IconWithCaution)).to.have.lengthOf(1);
    expect(wrapper.find(IconWithCaution).prop('alertSeverityLevel')).to.equal(
      AlertSeverityLevelType.Warning,
    );
  });

  it('should use the normal icon', () => {
    const props = {
      classes: '',
      onClick: () => {},
    };
    const wrapper = shallowWithIntl(<FavouritesTabLabel {...props} />);
    expect(wrapper.find(Icon)).to.have.lengthOf(1);
  });
});
