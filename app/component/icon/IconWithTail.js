import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

const IconWithTail = ({ className, id, img, rotate = 180, children }) => (
  <span><svg
    id={id} viewBox="0 0 80 80" className={cx('icon', className)}
  ><use
    xlinkHref="#icon-icon_vehicle-live-shadow"
    transform={`rotate(${rotate} 40 40)`}
  /><use xlinkHref={`#${img}`} transform="translate(26 26) scale(0.35)  " />
  {children}</svg></span>);

IconWithTail.displayName = 'IconWithTail';

IconWithTail.description = (
  <div>
    <p>Shows an icon from the SVG sprite and adds blue 'tail'.</p>
    <ComponentUsageExample description="rotate 0">
      <IconWithTail className="bus tail-icon" img="icon-icon_bus-live" rotate={0} />
    </ComponentUsageExample>
    <ComponentUsageExample description="rotate 90">
      <IconWithTail className="tram tail-icon" img="icon-icon_bus-live" rotate={90} />
    </ComponentUsageExample>
  </div>);

IconWithTail.propTypes = {
  id: React.PropTypes.string,
  className: React.PropTypes.string,
  img: React.PropTypes.string.isRequired,
  rotate: React.PropTypes.number,
  children: React.PropTypes.element,
};

export default IconWithTail;
