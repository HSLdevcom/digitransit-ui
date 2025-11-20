import React from 'react';

import { mount } from 'enzyme';
import Icon from '../../../app/component/Icon';
import IconBackground from '../../../app/component/icon/IconBackground';
import { renderAsString } from '../../../app/util/mapIconUtils';

describe('<Icon />', () => {
  const className = 'foo_class';
  const id = 'foo_id';
  const img = 'icon_bus';

  it('should include a circle as part of the svg render', () => {
    const props = { className, id, img };
    const wrapper = mount(
      <Icon {...props}>
        <IconBackground backgroundShape="circle" />
      </Icon>,
    );
    expect(wrapper.find('svg')).to.have.lengthOf(1);
    expect(wrapper.find('use')).to.have.lengthOf(1);
    expect(wrapper.find('circle')).to.have.lengthOf(1);
  });

  it('should include expected parts of the svg in its string representation', () => {
    const result = renderAsString(
      <Icon id={id} img={img} className={className}>
        <IconBackground backgroundShape="circle" />
      </Icon>,
    );
    expect(result).to.contain(`class="icon ${className}"`);
    expect(result).to.contain('circle');
  });

  it('should render <image /> if dataURI is defined', () => {
    const dataURI = 'data:image/svg+xml;base64,PDKROJASD';
    const props = { className, id, img, dataURI };
    const wrapper = mount(<Icon {...props} />);
    expect(wrapper.find('image')).to.have.lengthOf(1);
  });
});
