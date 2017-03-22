import React, { PropTypes } from 'react';

import ComponentUsageExample from './ComponentUsageExample';

const IconWithIcon = ({ id, className, img, subIcon, iconTransform,
  subIconTransform, subIconStyle }) => (
    <svg id={id} viewBox="0 0 40 40" className={`icon ${className}`}>
      <use
        xlinkHref={`#${img}`}
        transform={iconTransform}
      />
      <use
        xlinkHref={`#${subIcon}`}
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
      <IconWithIcon className="bus" img={'icon-icon_bus'} subIcon="icon-icon_call" />
    </ComponentUsageExample>
  </div>;

IconWithIcon.displayName = 'IconWithIcon';

IconWithIcon.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  img: PropTypes.string.isRequired,
  subIcon: PropTypes.string,
  iconTransform: PropTypes.string,
  subIconTransform: PropTypes.string,
  subIconStyle: PropTypes.string,
};

IconWithIcon.defaultProps = {
  subIcon: 'icon-icon_caution',
  className: '',
  iconTransform: 'scale(0.9) translate(5)',
  subIconTransform: 'scale(0.7) translate(0,20) ',
  subIconStyle: {},
};

export default IconWithIcon;
