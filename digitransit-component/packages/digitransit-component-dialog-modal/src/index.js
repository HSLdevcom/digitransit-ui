/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { I18nextProvider, useTranslation } from 'react-i18next';
import Modal from '@hsl-fi/modal';
import styles from './helpers/styles.scss';
import i18n from './helpers/i18n';

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
  const [t] = useTranslation();

  return (
    <Modal
      appElement={appElement}
      contentLabel={modalAriaLabel}
      closeButtonLabel={t('close-modal', { lng: lang })}
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
  lang: PropTypes.string.isRequired,
  modalAriaLabel: PropTypes.string,
  href: PropTypes.string,
  color: PropTypes.string,
  hoverColor: PropTypes.string,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number,
  }),
};

DialogModal.defaultProps = {
  dialogContent: undefined,
  handleClose: () => {},
  secondaryButtonText: undefined,
  secondaryButtonOnClick: undefined,
  href: undefined,
  modalAriaLabel: '',
  color: '#007ac9',
  hoverColor: '#0062a1',
  fontWeights: {
    medium: 500,
  },
};

DialogModal.contextTypes = {
  config: PropTypes.object,
};

export default props => (
  <I18nextProvider i18n={i18n}>
    <DialogModal {...props} />
  </I18nextProvider>
);
