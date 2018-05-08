import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';
import Icon from './Icon';
import { Toggle } from 'material-ui';

class ToggleButton extends React.Component {
  render() {
    const { intl } = this.context;
    const {
      checkedClass,
      state,
      icon,
      className,
      onBtnClick,
      style,
      label,
      children,
      buttonRef,
      ...rest
    } = this.props;

    const classes = {
      btn: true,
    };

    if (state) {
      classes[checkedClass] = state;
    }

    return (
      <button
        className={cx('cursor-pointer', classes, className)}
        onClick={onBtnClick}
        style={style}
        title={intl.formatMessage({ id: label })}
        aria-label={intl.formatMessage({ id: label })}
        ref={buttonRef ? ref => buttonRef(ref) : null}
        {...rest}
      >
        {icon && (
          <div className="icon-holder">
            <Icon img={`icon-icon_${icon}`} className="" />
          </div>
        )}
        <div>{children}</div>
      </button>
    );
  }
}

ToggleButton.contextTypes = {
  intl: intlShape.isRequired,
};

ToggleButton.propTypes = {
  onBtnClick: PropTypes.func.isRequired,
  checkedClass: PropTypes.string,
  state: PropTypes.bool,
  icon: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  style: PropTypes.object,
  children: PropTypes.array,
  buttonRef: PropTypes.func,
};

export default ToggleButton;
