import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';

const AddIcon = ({ id }) => (
  <svg id={id} viewBox="0 0 40 40" className={cx('icon')}>
    <circle strokeWidth="2" stroke="currentColor" fill="currentColor" cx="20" cy="20" r="19" />
    <use
      xlinkHref="#icon-icon_plus"
      transform="scale(0.7,0.7)"
      y="8"
      x="8"
      style={{ color: 'white', fill: 'white' }}
    />
  </svg>
);

AddIcon.description = () =>
  <ComponentUsageExample description="Add icon">
    <AddIcon />
  </ComponentUsageExample>;

AddIcon.displayName = 'IconWithCaution';

AddIcon.propTypes = {
  id: React.PropTypes.string,
};

export default AddIcon;
