import PropTypes from 'prop-types';
import React from 'react';
import IconWithIcon from './IconWithIcon';
import ComponentUsageExample from './ComponentUsageExample';

const IconWithBigCaution = ({ img, className, color }) => (
  <IconWithIcon
    className={className}
    color={color}
    img={img}
    subIcon="icon-icon_caution"
    subIconClassName="subicon-caution"
  />
);

IconWithBigCaution.displayName = 'IconWithBigCaution';

IconWithBigCaution.description = () => (
  <ComponentUsageExample description="Bus with caution">
    <div style={{ paddingLeft: '5px' }}>
      <IconWithBigCaution className="bus" img="icon-icon_bus" />
    </div>
  </ComponentUsageExample>
);

IconWithBigCaution.propTypes = {
  color: PropTypes.string,
  className: PropTypes.string,
  img: PropTypes.string.isRequired,
};

IconWithBigCaution.defaultProps = {
  className: '',
};

export default IconWithBigCaution;
