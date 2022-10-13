/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import i18next from 'i18next';
import Modal from '@hsl-fi/modal';
import styles from './helpers/styles.scss';
import translations from './helpers/translations';

i18next.init({
  lng: 'fi',
  fallbackLng: 'fi',
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
});
Object.keys(translations).forEach(lang => {
  i18next.addResourceBundle(lang, 'translation', translations[lang]);
});

const isKeyboardSelectionEvent = event => {
  const space = [13, ' ', 'Spacebar'];
  const enter = [32, 'Enter'];
  const key = (event && (event.key || event.which || event.keyCode)) || '';

  if (!key || !space.concat(enter).includes(key)) {
    return false;
  }
  event.preventDefault();
  return true;
};
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
  href,
  appElement,
  isModalOpen,
  modalAriaLabel,
  color,
  hoverColor,
  fontWeights,
}) => {
  i18next.changeLanguage(lang);
  return (
    <Modal
      appElement={appElement}
      contentLabel={modalAriaLabel}
      closeButtonLabel={i18next.t('close-modal')}
      variant="confirmation"
      isOpen={isModalOpen}
      onCrossClick={handleClose}
    >
      <div
        style={{
          '--color': `${color}`,
          '--hover-color': `${hoverColor}`,
          '--font-weight-medium': fontWeights.medium,
        }}
      >
        <div className={styles['digitransit-dialog-modal-top']}>
          <div className={styles['digitransit-dialog-modal-header']}>
            {headerText}
          </div>
          {dialogContent && (
            <div className={styles['digitransit-dialog-modal-content']}>
              {dialogContent}
            </div>
          )}
        </div>
        <div className={styles['digitransit-dialog-modal-buttons']}>
          {
            <a
              type="button"
              role="button"
              tabIndex="0"
              className={cx(
                styles['digitransit-dialog-modal-button'],
                styles.primary,
              )}
              href={href}
              onKeyDown={e => {
                if (isKeyboardSelectionEvent(e)) {
                  e.stopPropagation();
                  primaryButtonOnClick(e);
                }
              }}
              onClick={e => {
                e.stopPropagation();
                primaryButtonOnClick(e);
              }}
            >
              {primaryButtonText}
            </a>
          }
          {secondaryButtonText && secondaryButtonOnClick && (
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
      </div>
    </Modal>
  );
};

DialogModal.propTypes = {
  appElement: PropTypes.string.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  headerText: PropTypes.string.isRequired,
  handleClose: PropTypes.func,
  primaryButtonText: PropTypes.string.isRequired,
  primaryButtonOnClick: PropTypes.func.isRequired,
  secondaryButtonText: PropTypes.string,
  secondaryButtonOnClick: PropTypes.func,
  dialogContent: PropTypes.string,
  lang: PropTypes.string,
  modalAriaLabel: PropTypes.string,
  href: PropTypes.string,
  color: PropTypes.string,
  hoverColor: PropTypes.string,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number,
  }),
};

DialogModal.defaultProps = {
  lang: 'fi',
  dialogContent: undefined,
  secondaryButtonText: undefined,
  secondaryButtonOnClick: undefined,
  href: undefined,
  color: '#007ac9',
  hoverColor: '#0062a1',
  fontWeights: {
    medium: 500,
  },
};

DialogModal.contextTypes = {
  config: PropTypes.object,
};

export default DialogModal;
