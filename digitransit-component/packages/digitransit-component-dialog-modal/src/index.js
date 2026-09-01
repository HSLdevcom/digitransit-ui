/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import { defaultColors } from '@digitransit-component/digitransit-component-icon';
import styles from './helpers/styles.scss';

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
  isModalOpen,
  colors,
  fontWeights,
}) => {
  return (
    <Modal
      lang={lang}
      open={isModalOpen}
      onOpenChange={open => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <ModalContent title={headerText} lang={lang}>
        <div
          style={{
            '--color': `${colors.primary}`,
            '--hover-color': `${colors.hover}`,
            '--font-weight-medium': fontWeights.medium,
          }}
        >
          {dialogContent && (
            <div className={styles['digitransit-dialog-modal-content']}>
              {dialogContent}
            </div>
          )}
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
      </ModalContent>
    </Modal>
  );
};

DialogModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  headerText: PropTypes.string.isRequired,
  handleClose: PropTypes.func,
  primaryButtonText: PropTypes.string.isRequired,
  primaryButtonOnClick: PropTypes.func.isRequired,
  secondaryButtonText: PropTypes.string,
  secondaryButtonOnClick: PropTypes.func,
  dialogContent: PropTypes.string,
  lang: PropTypes.string.isRequired,
  href: PropTypes.string,
  colors: PropTypes.objectOf(PropTypes.string),
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
  colors: defaultColors,
  fontWeights: {
    medium: 500,
  },
};

export default DialogModal;
