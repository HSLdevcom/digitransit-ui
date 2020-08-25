/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './desktop.scss';

const DesktopModal = ({
  headerText,
  closeArialLabel,
  autosuggestComponent,
  closeModal,
  inputPlaceholder,
  specifyName,
  name,
  chooseIconText,
  favouriteIconTable,
  saveFavourite,
  saveText,
  canSave,
  isEdit,
  cancelText,
  cancelSelected,
}) => {
  return (
    <div className={styles['favourite-modal-desktop-container']}>
      <div className={styles['favourite-modal-desktop-top']}>
        <div className={styles['favourite-modal-desktop-header']}>
          {headerText}
        </div>
        <div
          className={styles['favourite-modal-desktop-close']}
          role="button"
          tabIndex="0"
          onClick={closeModal}
          aria-label={closeArialLabel}
        >
          <Icon img="close" />
        </div>
      </div>
      <div className={styles['favourite-modal-desktop-main']}>
        <div className={styles['favourite-modal-desktop-location-search']}>
          {autosuggestComponent}
        </div>
        <div className={styles['favourite-modal-desktop-name']}>
          <input
            className={styles['favourite-modal-desktop-input']}
            value={name}
            placeholder={inputPlaceholder}
            onChange={specifyName}
          />
        </div>
      </div>
      <div className={styles['favourite-modal-desktop-text']}>
        {chooseIconText}
      </div>
      <div className={styles['favourite-modal-desktop-icons']}>
        {favouriteIconTable}
      </div>
      <div className={styles['favourite-modal-desktop-buttons']}>
        <button
          type="button"
          className={cx(
            `${styles['favourite-modal-desktop-button']} ${styles.save} ${
              canSave() ? '' : styles.disabled
            }`,
          )}
          onClick={saveFavourite}
        >
          {saveText}
        </button>
        {isEdit && (
          <button
            type="button"
            className={cx(
              `${styles['favourite-modal-desktop-button']} ${styles.edit} ${
                canSave() ? '' : styles.disabled
              }`,
            )}
            onClick={cancelSelected}
          >
            {cancelText}
          </button>
        )}
      </div>
    </div>
  );
};

DesktopModal.propTypes = {
  headerText: PropTypes.string.isRequired,
  closeArialLabel: PropTypes.string.isRequired,
  autosuggestComponent: PropTypes.node.isRequired,
  closeModal: PropTypes.func.isRequired,
  inputPlaceholder: PropTypes.string.isRequired,
  specifyName: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  chooseIconText: PropTypes.string.isRequired,
  favouriteIconTable: PropTypes.node.isRequired,
  saveFavourite: PropTypes.func.isRequired,
  saveText: PropTypes.string.isRequired,
  canSave: PropTypes.func.isRequired,
  isEdit: PropTypes.bool,
  cancelText: PropTypes.string.isRequired,
  cancelSelected: PropTypes.func,
};

DesktopModal.defaultProps = {
  isEdit: false,
  cancelSelected: () => ({}),
};

export default DesktopModal;
