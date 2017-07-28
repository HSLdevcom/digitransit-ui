import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

const inputOrPlaceholder = (value, placeholder, onClick) => {
  const hasInput = value !== undefined && value !== null && value !== '';
  return (
    <input
      onClick={onClick}
      onKeyPress={onClick}
      className={`no-select address-${hasInput ? 'input' : 'placeholder'}`}
      value={hasInput ? value : placeholder}
    />
  );
};

const FakeSearchBar = ({
  id,
  onClick,
  className,
  endpointAddress,
  placeholder,
}) =>
  <div id={id} className={cx('input-placeholder', className)}>
    {inputOrPlaceholder(endpointAddress, placeholder, onClick)}
  </div>;

FakeSearchBar.propTypes = {
  className: PropTypes.string,
  endpointAddress: PropTypes.string,
  id: PropTypes.string,
  onClick: PropTypes.func,
  placeholder: PropTypes.string.isRequired,
};

FakeSearchBar.displayName = 'FakeSearchBar';
export default FakeSearchBar;
