import React from 'react';
import cx from 'classnames';
import Icon from './Icon';

const ToggleButton = ({ checkedClass, state, icon, className, onBtnClick, style, children }) => {
  let iconTag;

  const classes = {
    btn: true,
  };

  if (state) {
    classes[checkedClass] = state;
  }

  if (icon) {
    iconTag = <div className="icon-holder"><Icon img={`icon-icon_${icon}`} className="" /></div>;
  }

  return (<div
    className={cx('cursor-pointer', classes, className)}
    onClick={onBtnClick}
    style={style}
  >
    {iconTag}
    <div>{children}</div>
  </div>);
};


ToggleButton.propTypes = {
  onBtnClick: React.PropTypes.func,
  checkedClass: React.PropTypes.string,
  state: React.PropTypes.bool,
  icon: React.PropTypes.string,
  className: React.PropTypes.string,
  style: React.PropTypes.object,
  children: React.PropTypes.array,
};


export default ToggleButton;
