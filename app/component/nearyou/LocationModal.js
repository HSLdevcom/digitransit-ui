import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import DTIcon from '@digitransit-component/digitransit-component-icon';
import Modal from '@hsl-fi/modal';
import { useTranslationsContext } from '../../util/useTranslationsContext';

export default function LocationModal({
  handleClose,
  startGeolocation,
  showGeolocationButton,
  showInfo,
  children,
}) {
  const intl = useTranslationsContext();
  return (
    <Modal
      appElement="#app"
      contentLabel="content label"
      closeButtonLabel={intl.formatMessage({ id: 'close' })}
      variant="small"
      isOpen
      onCrossClick={handleClose}
    >
      <div className="modal-desktop-container">
        <div className="modal-desktop-top">
          <div className="modal-desktop-header">
            <FormattedMessage id="stop-near-you-modal-header" />
          </div>
        </div>
        <div className="modal-desktop-text">
          <FormattedMessage id="stop-near-you-modal-info" />
        </div>
        <div className="modal-desktop-text title">
          <FormattedMessage id="origin" />
        </div>
        <div className="modal-desktop-main">
          <div className="modal-desktop-location-search">{children}</div>
        </div>
        <div className="modal-desktop-text title2">
          <FormattedMessage id="stop-near-you-modal-grant-permission" />
        </div>
        {showGeolocationButton && (
          <div className="modal-desktop-buttons">
            <button
              type="submit"
              className="modal-desktop-button save"
              onClick={startGeolocation}
            >
              <DTIcon img="locate" height={1.375} width={1.375} />
              <FormattedMessage id="use-own-position" />
            </button>
          </div>
        )}
        {showInfo && (
          <div className="modal-desktop-text info">
            <FormattedMessage id="stop-near-you-modal-grant-permission-info" />
          </div>
        )}
      </div>
    </Modal>
  );
}

LocationModal.propTypes = {
  handleClose: PropTypes.func.isRequired,
  startGeolocation: PropTypes.func.isRequired,
  showGeolocationButton: PropTypes.bool.isRequired,
  showInfo: PropTypes.bool.isRequired,
  children: PropTypes.node,
};

LocationModal.defaultProps = { children: null };
