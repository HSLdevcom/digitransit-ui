import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import Icon from '../../../app/component/Icon';
import IconWithIcon from '../../../app/component/IconWithIcon';

describe('<IconWithIcon />', () => {
  it('should apply the given sub icon shape', () => {
    const props = {
      img: 'img',
      subIcon: 'sub-img',
      subIconShape: 'circle',
    };
    const wrapper = shallowWithIntl(<IconWithIcon {...props} />);
    expect(
      wrapper
        .find(Icon)
        .at(1)
        .prop('backgroundShape'),
    ).to.equal('circle');
  });
});
