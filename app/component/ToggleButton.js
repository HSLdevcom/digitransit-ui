import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';
import getContext from 'recompose/getContext';
import Icon from './Icon';

const ToggleButton = ({
  checkedClass,
  state,
  icon,
  className,
  onBtnClick,
  style,
  label,
  intl,
  children,
}) => {
  let iconTag;

  const classes = {
    btn: true,
  };

  if (state) {
    classes[checkedClass] = state;
  }

  if (icon) {
    iconTag = (
      <div className="icon-holder">
        <Icon
          img={`icon-icon_${icon}`}
          className=""
        />
      </div>
    );
  }

  return (
    <button
      className={cx('cursor-pointer', classes, className)}
      onClick={onBtnClick}
      style={style}
      title={intl.formatMessage({ id: label })}
      aria-label={intl.formatMessage({ id: label })}
    >
      {iconTag}
      <div>{children}</div>
    </button>
  );
};

ToggleButton.propTypes = {
  onBtnClick: PropTypes.func.isRequired,
  checkedClass: PropTypes.string,
  state: PropTypes.bool,
  icon: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  style: PropTypes.object,
  intl: intlShape.isRequired,
  children: PropTypes.array,
};

export default getContext({
  intl: intlShape.isRequired,
})(ToggleButton);
