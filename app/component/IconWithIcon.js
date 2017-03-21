import React from 'react';

import ComponentUsageExample from './ComponentUsageExample';

const IconWithIcon = ({ id, className, img, caution, iconTransform,
  subIconTransform, subIconStyle }) => (
    <svg id={id} viewBox="0 0 40 40" className={`icon ${className}`}>
      <use
        xlinkHref={`#${img}`}
        transform={iconTransform}
      />
      <use
        xlinkHref={`#${caution}`}
        transform={subIconTransform}
        style={subIconStyle}
      />
    </svg>
);

IconWithIcon.description = () =>
  <div>
    <ComponentUsageExample description="Bus with caution">
      <IconWithIcon className="bus" img={'icon-icon_bus'} subIconStyle={{ color: 'white', fill: 'red' }} />
    </ComponentUsageExample>
    <ComponentUsageExample description="Bus with call agency caution">
      <IconWithIcon className="bus" img={'icon-icon_bus'} caution="icon-icon_call" />
    </ComponentUsageExample>
  </div>;

IconWithIcon.displayName = 'IconWithIcon';

IconWithIcon.propTypes = {
  id: React.PropTypes.string,
  className: React.PropTypes.string,
  img: React.PropTypes.string.isRequired,
  caution: React.PropTypes.string,
  iconTransform: React.PropTypes.string,
  subIconTransform: React.PropTypes.string,
  subIconStyle: React.PropTypes.sting,
};

IconWithIcon.defaultProps = {
  caution: 'icon-icon_caution',
  className: '',
  iconTransform: 'translate(5) scale(0.8)',
  subIconTransform: 'translate(0,20) scale(0.5)',
  subIconStyle: {},
};

export default IconWithIcon;
