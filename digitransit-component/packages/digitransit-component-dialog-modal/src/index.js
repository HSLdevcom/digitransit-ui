/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import i18next from 'i18next';
import Modal from '@hsl-fi/modal';
import styles from './helpers/styles.scss';
import translations from './helpers/translations';

i18next.init({ lng: 'fi', resources: {} });

i18next.addResourceBundle('en', 'translation', translations.en);
i18next.addResourceBundle('fi', 'translation', translations.fi);
i18next.addResourceBundle('sv', 'translation', translations.sv);

/**
 * General component description in JSDoc format. Markdown is *supported*.
 *
 * @example
 * <DialogModal />
 */
const DialogModal = ({
  headerText,
  dialogContent,
  handleClose,
  primaryButtonText,
  primaryButtonOnClick,
  secondaryButtonText,
  secondaryButtonOnClick,
  lang,
  appElement,
  isModalOpen,
  modalAriaLabel,
}) => {
  i18next.changeLanguage(lang);

  const isMobile = () =>
    window && window.innerWidth ? window.innerWidth < 768 : false;

  return (
    <Modal
      appElement={appElement}
      contentLabel={modalAriaLabel}
      closeButtonLabel={i18next.t('close-favourite-modal')}
      variant={isMobile() ? 'large' : 'small'}
      isOpen={isModalOpen}
      onCrossClick={handleClose}
    >
      <div className={styles['digitransit-dialog-modal-top']}>
        <div className={styles['digitransit-dialog-modal-header']}>
          {headerText}
        </div>
      </div>
      {dialogContent && (
        <div className={styles['digitransit-dialog-modal-place']}>
          {dialogContent}
        </div>
      )}
      <div className={styles['digitransit-dialog-modal-buttons']}>
        {
          <button
            type="button"
            tabIndex="0"
            className={cx(
              styles['digitransit-dialog-modal-button'],
              styles.primary,
            )}
            onClick={() => primaryButtonOnClick()}
          >
            {primaryButtonText}
          </button>
        }
        {secondaryButtonText &&
          secondaryButtonOnClick && (
            <button
              type="button"
              tabIndex="0"
              className={cx(
                styles['digitransit-dialog-modal-button'],
                styles.secondary,
              )}
              onClick={() => secondaryButtonOnClick()}
            >
              {secondaryButtonText}
            </button>
          )}
      </div>
    </Modal>
  );
};

DialogModal.propTypes = {
  appElement: PropTypes.string.isRequired,
  isModalOpen: PropTypes.string.isRequired,
  headerText: PropTypes.string.isRequired,
  handleClose: PropTypes.func,
  primaryButtonText: PropTypes.string.isRequired,
  primaryButtonOnClick: PropTypes.func.isRequired,
  secondaryButtonText: PropTypes.string,
  secondaryButtonOnClick: PropTypes.func,
  dialogContent: PropTypes.string,
  lang: PropTypes.string,
  modalAriaLabel: PropTypes.string,
};

DialogModal.defaultProps = {
  lang: 'fi',
  dialogContent: undefined,
  secondaryButtonText: undefined,
  secondaryButtonOnClick: undefined,
};

export default DialogModal;
