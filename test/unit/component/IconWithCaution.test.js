import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import IconWithCaution from '../../../app/component/IconWithCaution';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('<IconWithCaution />', () => {
  it('should use the caution icon if there is no severity level', () => {
    const props = {
      img: 'foobar',
    };
    const wrapper = shallowWithIntl(<IconWithCaution {...props} />);
    expect(
      wrapper
        .find('use')
        .at(1)
        .prop('xlinkHref'),
    ).to.contain('caution');
  });

  it('should use the info icon with a circular backgound if the severity level is "INFO"', () => {
    const props = {
      alertSeverityLevel: AlertSeverityLevelType.Info,
      img: 'foobar',
    };
    const wrapper = shallowWithIntl(<IconWithCaution {...props} />);
    expect(
      wrapper
        .find('use')
        .at(1)
        .prop('xlinkHref'),
    ).to.contain('info');
    expect(wrapper.find('circle')).to.have.lengthOf(1);
  });
});
