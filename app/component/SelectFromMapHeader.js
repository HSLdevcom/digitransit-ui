import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { useConfigContext } from '../configurations/ConfigContext';
import { useTranslationsContext } from '../util/useTranslationsContext';

export default function SelectFromMapHeader(props) {
  const { colors } = useConfigContext();
  const intl = useTranslationsContext();

  return (
    <div className="select-from-map-nav-container">
      {!props.hideBackBtn && (
        <button
          type="button"
          className="from-map-modal-nav-button"
          onClick={props.hideBackBtn ? undefined : props.onBackBtnClick}
          aria-label={intl.formatMessage({
            id: 'back-button-title',
            defaultMessage: 'Go back to previous page',
          })}
        >
          <Icon img="icon_arrow-left" color={colors.primary} />
        </button>
      )}
      <div className="select-from-map-nav-title">
        <FormattedMessage id={props.titleId} />
      </div>
      {!props.hideCloseBtn && (
        <button
          type="button"
          className="from-map-modal-nav-button"
          onClick={props.hideCloseBtn ? undefined : props.onCloseBtnClick}
          aria-label={intl.formatMessage({
            id: 'back-button-title',
            defaultMessage: 'Go back to previous page',
          })}
        >
          <Icon img="icon_close" color={colors.primary} />
        </button>
      )}
    </div>
  );
}

SelectFromMapHeader.propTypes = {
  titleId: PropTypes.string.isRequired,
  onBackBtnClick: PropTypes.func,
  onCloseBtnClick: PropTypes.func,
  hideBackBtn: PropTypes.bool,
  hideCloseBtn: PropTypes.bool,
};

SelectFromMapHeader.defaultProps = {
  onBackBtnClick: PropTypes.func,
  onCloseBtnClick: PropTypes.func,
  hideBackBtn: false,
  hideCloseBtn: false,
};
