import React from 'react';
import { render } from '@testing-library/react';
import Icon from '../../../app/component/Icon';
import IconBackground from '../../../app/component/icon/IconBackground';
import { renderAsString } from '../../../app/util/mapIconUtils';

describe('<Icon />', () => {
  const className = 'foo_class';
  const id = 'foo_id';
  const img = 'icon_bus';

  it('should include a circle as part of the svg render', () => {
    const { container } = render(
      <Icon
        className={className}
        id={id}
        img={img}
        background={<IconBackground shape="circle" />}
      />,
    );
    expect(container.querySelectorAll('svg')).to.have.lengthOf(1);
    expect(container.querySelectorAll('use')).to.have.lengthOf(1);
    expect(container.querySelectorAll('circle')).to.have.lengthOf(1);
  });

  it('should include expected parts of the svg in its string representation', () => {
    const result = renderAsString(
      <Icon
        id={id}
        img={img}
        className={className}
        background={<IconBackground shape="circle" />}
      />,
    );
    expect(result).to.contain(`class="icon ${className}"`);
    expect(result).to.contain('circle');
  });

  it('should render <image /> if dataURI is defined', () => {
    const dataURI = 'data:image/svg+xml;base64,PDKROJASD';
    const { container } = render(
      <Icon className={className} id={id} img={img} dataURI={dataURI} />,
    );
    expect(container.querySelectorAll('image')).to.have.lengthOf(1);
  });

  it('should reference the img prop via xlink:href on <use />', () => {
    const { container } = render(<Icon img={img} />);
    const use = container.querySelector('use');
    expect(use.getAttribute('xlink:href')).to.equal(`#${img}`);
  });

  it('should not render <use /> when dataURI is defined', () => {
    const { container } = render(
      <Icon img={img} dataURI="data:image/svg+xml;base64,ABC" />,
    );
    expect(container.querySelectorAll('use')).to.have.lengthOf(0);
  });

  it('should have default viewBox and omit it when omitViewBox is true', () => {
    const { container: withViewBox } = render(<Icon img={img} />);
    expect(withViewBox.querySelector('svg').getAttribute('viewBox')).to.equal(
      '0 0 40 40',
    );

    const { container: without } = render(<Icon img={img} omitViewBox />);
    expect(without.querySelector('svg').getAttribute('viewBox')).to.equal(null);
  });

  it('should set aria-label on the svg', () => {
    const label = 'Bus icon';
    const { container } = render(<Icon img={img} ariaLabel={label} />);
    expect(container.querySelector('svg').getAttribute('aria-label')).to.equal(
      label,
    );
  });
});
