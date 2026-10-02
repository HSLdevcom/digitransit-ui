import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Icon from './Icon';
import { useConfigContext } from '../client/ConfigContext';

export default function SelectFromMapHeader({
  titleId,
  onBackBtnClick,
  onCloseBtnClick,
  hideBackBtn = false,
  hideCloseBtn = false,
}) {
  const { colors } = useConfigContext();
  const intl = useIntl();

  return (
    <div className="select-from-map-nav-container">
      {!hideBackBtn && (
        <button
          type="button"
          className="from-map-modal-nav-button"
          onClick={hideBackBtn ? undefined : onBackBtnClick}
          aria-label={intl.formatMessage({
            id: 'back-button-title',
            defaultMessage: 'Go back to previous page',
          })}
        >
          <Icon img="icon_arrow-left" color={colors.primary} />
        </button>
      )}
      <div className="select-from-map-nav-title">
        <FormattedMessage id={titleId} />
      </div>
      {!hideCloseBtn && (
        <button
          type="button"
          className="from-map-modal-nav-button"
          onClick={hideCloseBtn ? undefined : onCloseBtnClick}
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
