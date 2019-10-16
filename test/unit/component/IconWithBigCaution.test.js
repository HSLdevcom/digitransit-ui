import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import IconWithBigCaution from '../../../app/component/IconWithBigCaution';
import IconWithIcon from '../../../app/component/IconWithIcon';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('<IconWithBigCaution />', () => {
  it('should have a caution sub icon by default', () => {
    it('should have a caution sub icon when alertSeverityLevel is not defined', () => {
      const props = {
        img: 'foobar',
      };
      const wrapper = shallowWithIntl(<IconWithBigCaution {...props} />);
      expect(wrapper.find(IconWithIcon).prop('subIcon')).to.equal(
        'icon-icon_caution',
      );
    });
  });

  it('should have a caution sub icon when alertSeverityLevel is high enough', () => {
    const props = {
      alertSeverityLevel: AlertSeverityLevelType.Warning,
      img: 'foobar',
    };
    const wrapper = shallowWithIntl(<IconWithBigCaution {...props} />);
    expect(wrapper.find(IconWithIcon).prop('subIcon')).to.equal(
      'icon-icon_caution',
    );
  });

  it('should have an info sub icon when alertSeverityLevel is "INFO"', () => {
    const props = {
      alertSeverityLevel: AlertSeverityLevelType.Info,
      img: 'foobar',
    };
    const wrapper = shallowWithIntl(<IconWithBigCaution {...props} />);
    expect(wrapper.find(IconWithIcon).prop('subIcon')).to.equal(
      'icon-icon_info',
    );
  });
});
