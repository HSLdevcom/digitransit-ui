import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import IconWithIcon from '../../../app/component/IconWithIcon';

describe('<IconWithIcon />', () => {
  it('should apply the given sub icon shape', () => {
    const props = {
      img: 'img',
      subIcon: 'sub-img',
      subIconShape: 'circle',
    };
    const { container } = renderWithProviders(<IconWithIcon {...props} />, {
      messages: { disruption: 'Disruption' },
    });
    expect(container.querySelectorAll('circle')).to.have.lengthOf(1);
  });
});
