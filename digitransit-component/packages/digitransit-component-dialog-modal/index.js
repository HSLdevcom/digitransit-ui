/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import i18next from 'i18next';
import Icon from '@digitransit-component/digitransit-component-icon';
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
  className,
  handleClose,
  primaryButtonText,
  primaryButtonOnClick,
  secondaryButtonText,
  secondaryButtonOnClick,
  lang,
}) => {
  i18next.changeLanguage(lang);

  const isMobile = () =>
    window && window.innerWidth ? window.innerWidth < 768 : false;

  return (
    <div className={styles['digitransit-dialog-modal']}>
      <section
        className={cx(
          styles['digitransit-dialog-modal-main'],
          styles[className],
        )}
      >
        <div className={styles['digitransit-dialog-modal-top']}>
          <div className={styles['digitransit-dialog-modal-header']}>
            {headerText}
          </div>
          {!isMobile() && (
            <div
              className={styles['digitransit-dialog-modal-close']}
              role="button"
              tabIndex="0"
              onClick={() => handleClose()}
              onKeyDown={e => {
                if (e.keyCode === 32 || e.keyCode === 13) {
                  handleClose();
                }
              }}
              aria-label={i18next.t('close-modal')}
            >
              <Icon img="close" />
            </div>
          )}
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
              onClick={primaryButtonOnClick}
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
                onClick={secondaryButtonOnClick}
              >
                {secondaryButtonText}
              </button>
            )}
        </div>
      </section>
    </div>
  );
};

DialogModal.propTypes = {
  headerText: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  primaryButtonText: PropTypes.string.isRequired,
  primaryButtonOnClick: PropTypes.func.isRequired,
  secondaryButtonText: PropTypes.string,
  secondaryButtonOnClick: PropTypes.func,
  dialogContent: PropTypes.string,
  className: PropTypes.string,
  lang: PropTypes.string,
};

DialogModal.defaultProps = {
  className: '',
  lang: 'fi',
  dialogContent: undefined,
  secondaryButtonText: undefined,
  secondaryButtonOnClick: undefined,
};

export default DialogModal;
