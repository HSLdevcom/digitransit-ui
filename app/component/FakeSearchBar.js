import React from 'react';
import cx from 'classnames';

const inputOrPlaceholder = (value, placeholder) => {
  if (value !== undefined && value !== null && value !== '') {
    return <div className="address-input no-select">{value}</div>;
  }
  return <div className="address-placeholder no-select">{placeholder}</div>;
};

const FakeSearchBar =
  ({ id, onClick, className, endpointAddress, placeholder }) => (
    <div id={id} onClick={onClick}>
      <div className={cx('input-placeholder', className)}>
        {inputOrPlaceholder(endpointAddress, placeholder)}
      </div>
    </div>
    );

FakeSearchBar.propTypes = {
  className: React.PropTypes.string,
  endpointAddress: React.PropTypes.string,
  id: React.PropTypes.string,
  onClick: React.PropTypes.func,
  placeholder: React.PropTypes.string.isRequired,
};

FakeSearchBar.displayName = 'FakeSearchBar';
export default FakeSearchBar;
