import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { intlShape, FormattedMessage } from 'react-intl';
import Icon from './Icon';

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
      showButtonTitle,
      ariaLabel, // DT-3268
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
        title={
          ariaLabel
            ? intl.formatMessage({ id: ariaLabel })
            : intl.formatMessage({ id: label })
        } // DT-3268 check if ariaLabel has been given
        aria-label={
          ariaLabel
            ? intl.formatMessage({ id: ariaLabel })
            : intl.formatMessage({ id: label })
        } // DT-3268 check if ariaLabel has been given
        ref={buttonRef ? ref => buttonRef(ref) : null}
        {...rest}
      >
        {icon && (
          <div className="icon-holder">
            <Icon img={`icon-icon_${icon}`} className="" />
          </div>
        )}
        {showButtonTitle && (
          <div className="toggle-button-title">
            <FormattedMessage id={label} />
          </div>
        )}
        {children && <React.Fragment>{children}</React.Fragment>}
      </button>
    );
  }
}

ToggleButton.contextTypes = {
  intl: intlShape.isRequired, // eslint-disable-line react/no-typos
};

ToggleButton.propTypes = {
  onBtnClick: PropTypes.func.isRequired,
  checkedClass: PropTypes.string,
  state: PropTypes.bool,
  icon: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  style: PropTypes.object,
  children: PropTypes.node,
  buttonRef: PropTypes.func,
  showButtonTitle: PropTypes.bool,
  ariaLabel: PropTypes.string, // DT-3268
};

ToggleButton.defaultProps = {
  showButtonTitle: false,
};

export default ToggleButton;
