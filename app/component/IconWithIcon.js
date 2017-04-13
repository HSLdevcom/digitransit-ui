import React, { PropTypes } from 'react';

import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

const subIconTemplate = { fontSize: '65%', position: 'absolute', bottom: '-0.3em', left: '-0.3em' };
const IconWithIcon = ({ id, className, img, subIcon, subIconClassName }) => (
  <span style={{ position: 'relative' }} id={id} className={className}>
    <span ><Icon img={img} /></span>
    {subIcon && <span className={subIconClassName} style={subIconTemplate}>
      <Icon img={subIcon} /></span>}
  </span>
  );

IconWithIcon.description = () =>
  <div>
    <ComponentUsageExample description="Bus with caution">
      <div style={{ paddingLeft: '5px' }}>
        <IconWithIcon
          className="bus"
          img="icon-icon_bus"
          subIcon="icon-icon_caution"
          subIconClassName="subicon-caution"
        />
      </div>
    </ComponentUsageExample>
    <ComponentUsageExample description="Bus with call agency caution">
      <div style={{ paddingLeft: '5px' }}>
        <IconWithIcon className="bus" img="icon-icon_bus" subIcon="icon-icon_call" />
      </div>
    </ComponentUsageExample>
    <ComponentUsageExample description="Bus with call agency caution, with 5em base font size">
      <div style={{ fontSize: '5em', paddingLeft: '5px' }}>
        <IconWithIcon className="bus" img="icon-icon_bus" subIcon="icon-icon_call" />
      </div>
    </ComponentUsageExample>
  </div>;

IconWithIcon.displayName = 'IconWithIcon';

IconWithIcon.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  img: PropTypes.string.isRequired,
  subIcon: PropTypes.string,
  subIconClassName: PropTypes.string,
};

IconWithIcon.defaultProps = {
  id: '',
  subIcon: '',
  className: '',
  subIconClassName: '',
  subIconStyle: {},
};

export default IconWithIcon;
