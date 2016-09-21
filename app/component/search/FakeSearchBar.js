import React from 'react';
import cx from 'classnames';
import pure from 'recompose/pure';

const inputOrPlaceholder = (value, placeholder) => {
  if (value !== undefined && value !== null && value !== '') {
    return <div className="address-input no-select">{value}</div>;
  }
  return <div className="address-placeholder no-select">{placeholder}</div>;
};

const FakeSearchBar = pure(
  (props) => (
    <div id={props.id} onClick={props.onClick}>
      <div className={cx('input-placeholder', props.className)}>
        {inputOrPlaceholder(props.endpointAddress, props.placeholder)}
      </div>
    </div>
    ));

FakeSearchBar.propTypes = {
  className: React.PropTypes.string,
  endpointAddress: React.PropTypes.string,
  id: React.PropTypes.string,
  onClick: React.PropTypes.func,
  placeholder: React.PropTypes.string.isRequired,
  value: React.PropTypes.string,
};

FakeSearchBar.displayName = 'FakeSearchBar';
export default FakeSearchBar;
