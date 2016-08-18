import React from "react";
import cx from "classnames";

const inputOrPlaceholder = function (value, placeholder) {
  if (value !== undefined && value !== null && value !== "") {
    return <div className="address-input no-select">{value}</div>;
  } else {
    return <div className="address-placeholder no-select">{placeholder}</div>;
  }
};

const FakeSearchBar = function (props) {
  let ref;

  return <div id={props.id} onClick={props.onClick}><div className={cx("input-placeholder", props.className)}>{inputOrPlaceholder((ref = props.endpoint) != null ? ref.address : void 0, props.placeholder)}</div></div>;
};

FakeSearchBar.propTypes = {
  placeholder: React.PropTypes.string.isRequired,
  className: React.PropTypes.string,
  value: React.PropTypes.string,
  onClick: React.PropTypes.func
};

FakeSearchBar.displayName = "FakeSearchBar";
export default FakeSearchBar;
