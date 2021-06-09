import PropTypes from 'prop-types';
import React from 'react';

import { intlShape } from 'react-intl';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

const IconWithIcon = (
  {
    badgeFill,
    badgeText,
    badgeTextFill,
    className,
    color,
    id,
    img,
    subIcon,
    subIconClassName,
    subIconShape,
  },
  { intl },
) => (
  <span id={id} className={className}>
    <span>
      <Icon
        badgeFill={badgeFill}
        badgeText={badgeText}
        badgeTextFill={badgeTextFill}
        color={color}
        img={img}
      />
    </span>
    {subIcon && (
      <span
        className={subIconClassName}
        title={intl.formatMessage({ id: 'disruption' })}
      >
        <Icon backgroundShape={subIconShape} img={subIcon} />
      </span>
    )}
  </span>
);

IconWithIcon.description = () => (
  <div>
    <ComponentUsageExample description="Bus with caution">
      <div style={{ paddingLeft: '5px', position: 'relative' }}>
        <IconWithIcon
          className="bus"
          img="icon-icon_bus"
          subIcon="icon-icon_caution"
          subIconClassName="subicon-caution-no-excl"
        />
      </div>
    </ComponentUsageExample>
    <ComponentUsageExample description="Bus with info level alert">
      <div style={{ paddingLeft: '5px', position: 'relative' }}>
        <IconWithIcon
          className="bus"
          img="icon-icon_bus"
          subIcon="icon-icon_info"
          subIconClassName="subicon-info"
        />
      </div>
    </ComponentUsageExample>
    <ComponentUsageExample description="Bus with call agency caution">
      <div style={{ paddingLeft: '5px', position: 'relative' }}>
        <IconWithIcon
          className="bus"
          img="icon-icon_bus"
          subIcon="icon-icon_call"
        />
      </div>
    </ComponentUsageExample>
    <ComponentUsageExample description="Bus with call agency caution, with 5em base font size">
      <div
        style={{ fontSize: '5em', paddingLeft: '5px', position: 'relative' }}
      >
        <IconWithIcon
          className="bus"
          img="icon-icon_bus"
          subIcon="icon-icon_call"
        />
      </div>
    </ComponentUsageExample>
  </div>
);

IconWithIcon.displayName = 'IconWithIcon';

IconWithIcon.propTypes = {
  badgeFill: PropTypes.string,
  badgeText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  badgeTextFill: PropTypes.string,
  className: PropTypes.string,
  color: PropTypes.string,
  id: PropTypes.string,
  img: PropTypes.string.isRequired,
  subIcon: PropTypes.string,
  subIconClassName: PropTypes.string,
  subIconShape: PropTypes.string,
};

IconWithIcon.contextTypes = {
  intl: intlShape.isRequired,
};

IconWithIcon.defaultProps = {
  badgeFill: undefined,
  badgeText: undefined,
  badgeTextFill: undefined,
  className: '',
  id: '',
  subIcon: '',
  subIconClassName: '',
  subIconShape: undefined,
};

export default IconWithIcon;
