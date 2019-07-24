import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import Icon from '../../../app/component/Icon';

describe('<Icon />', () => {
  const backgroundShape = 'circle';
  const className = 'foo_class';
  const id = 'foo_id';
  const img = 'icon-icon_bus';

  it('should include a circle as part of the svg render', () => {
    const props = { backgroundShape, className, id, img };
    const wrapper = shallowWithIntl(<Icon {...props} />);
    expect(wrapper.find('circle')).to.have.lengthOf(1);
  });

  it('should include a circle as part of the svg string representation', () => {
    const result = Icon.asString({ backgroundShape, className, id, img });
    expect(result).to.contain('<circle');
  });

  it('should render <image /> if dataURI is defined', () => {
    const dataURI = 'data:image/svg+xml;base64,PDKROJASD';
    const props = { className, id, img, dataURI };
    const wrapper = shallowWithIntl(<Icon {...props} />);
    expect(wrapper.find('image')).to.have.lengthOf(1);
  });
});
