import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { configShape } from '../util/shapes';
import Icon from './Icon';

export default function SelectFromMapHeaderComponent(props, { config, intl }) {
  const title =
    props.titleId !== undefined
      ? intl.formatMessage({
          id: props.titleId,
          defaultMessage: 'Select viaPoint',
        })
      : '';

  const backBtnCursorPointerClassName = `${
    props.hideBackBtn ? 'no-pointer' : 'cursor-pointer'
  }`;
  const closeBtnCursorPointerClassName = `${
    props.hideCloseBtn ? 'no-pointer' : 'cursor-pointer'
  }`;

  return (
    <div className="select-from-map-nav-container">
      <button
        type="button"
        className={`from-map-modal-nav-button ${backBtnCursorPointerClassName}`}
        onClick={props.hideBackBtn ? undefined : props.onBackBtnClick}
        aria-label={intl.formatMessage({
          id: 'back-button-title',
          defaultMessage: 'Go back to previous page',
        })}
      >
        {!props.hideBackBtn && (
          <Icon
            img={props.backBtnIcon}
            color={config.colors.primary}
            className={`${props.iconClassName} ${backBtnCursorPointerClassName}`}
          />
        )}
      </button>
      {title && !props.titleClassName && (
        <div className="select-from-map-nav-title">{title}</div>
      )}
      {title && props.titleClassName && (
        <span className={props.titleClassName}>{title}</span>
      )}
      <button
        type="button"
        className={`from-map-modal-nav-button ${closeBtnCursorPointerClassName}`}
        onClick={props.hideCloseBtn ? undefined : props.onCloseBtnClick}
        aria-label={intl.formatMessage({
          id: 'back-button-title',
          defaultMessage: 'Go back to previous page',
        })}
      >
        {!props.hideCloseBtn && (
          <Icon
            img={props.closeBtnIcon}
            color={config.colors.primary}
            className={`${props.iconClassName} ${closeBtnCursorPointerClassName}`}
          />
        )}
      </button>
    </div>
  );
}

SelectFromMapHeaderComponent.propTypes = {
  titleId: PropTypes.string,
  onBackBtnClick: PropTypes.func,
  onCloseBtnClick: PropTypes.func,
  backBtnIcon: PropTypes.string,
  closeBtnIcon: PropTypes.string,
  hideBackBtn: PropTypes.bool,
  hideCloseBtn: PropTypes.bool,
  titleClassName: PropTypes.string,
  iconClassName: PropTypes.string,
};

SelectFromMapHeaderComponent.defaultProps = {
  titleId: undefined,
  backBtnIcon: 'icon-icon_arrow-left',
  closeBtnIcon: 'icon-icon_close',
  onBackBtnClick: PropTypes.func,
  onCloseBtnClick: PropTypes.func,
  hideBackBtn: false,
  hideCloseBtn: false,
  titleClassName: undefined,
  iconClassName: undefined,
};

SelectFromMapHeaderComponent.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};
