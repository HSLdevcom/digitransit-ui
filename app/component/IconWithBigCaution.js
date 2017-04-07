import React from 'react';
import IconWithIcon from './IconWithIcon';
import ComponentUsageExample from './ComponentUsageExample';

const IconWithBigCaution = ({ id, img, className, color }) => (
  <IconWithIcon
    id={id}
    className={className}
    color={color}
    img={img}
    subIcon="icon-icon_caution"
    subIconClassName="subicon-caution"
  />
);

IconWithBigCaution.displayName = 'IconWithBigCaution';

IconWithBigCaution.description = () =>
  <ComponentUsageExample description="Bus with caution">
    <div style={{ paddingLeft: '5px' }}>
      <IconWithBigCaution className="bus" img={'icon-icon_bus'} />
    </div>
  </ComponentUsageExample>;

IconWithBigCaution.propTypes = {
  id: React.PropTypes.string,
  color: React.PropTypes.string,
  className: React.PropTypes.string,
  img: React.PropTypes.string.isRequired,
};

IconWithBigCaution.defaultProps = {
  id: 'IconWithBigCaution-default-id',
  className: '',
};

export default IconWithBigCaution;
