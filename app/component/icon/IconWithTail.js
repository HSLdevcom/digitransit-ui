import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

/**
 * wrapperClassName is here because Safari!
 */
const IconWithTail = ({ wrapperClassName, className, id, img, rotate = 180, children }) => (
  <span className={wrapperClassName}><svg
    id={id} viewBox="0 0 80 80" className={cx('icon', 'tail-icon', className)}
  ><use
    xlinkHref="#icon-icon_vehicle-live-shadow"
    transform={`rotate(${rotate} 40 40)`}
  /><use xlinkHref={`#${img}`} transform="translate(26 26) scale(0.35)  " />
  {children}</svg></span>);

IconWithTail.displayName = 'IconWithTail';

IconWithTail.description = (
  <div>
    <p>Shows an icon from the SVG sprite and adds blue 'tail'.</p>
    <ComponentUsageExample description="Rotate 0">
      <IconWithTail img="icon-icon_bus-live" rotate={0} />
    </ComponentUsageExample>
    <ComponentUsageExample description="Rotate 90">
      <IconWithTail img="icon-icon_bus-live" rotate={90} />
    </ComponentUsageExample>
    <ComponentUsageExample description="Rotate 90, custom class">
      <IconWithTail wrapperClassName="tail-icon-grayscale" img="icon-icon_bus-live" rotate={90} />
    </ComponentUsageExample>
  </div>);

IconWithTail.propTypes = {
  id: React.PropTypes.string,
  wrapperClassName: React.PropTypes.string,
  className: React.PropTypes.string,
  img: React.PropTypes.string.isRequired,
  rotate: React.PropTypes.number,
  children: React.PropTypes.element,
};

export default IconWithTail;
