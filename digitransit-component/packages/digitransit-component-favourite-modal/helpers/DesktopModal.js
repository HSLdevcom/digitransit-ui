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
      <div className={styles['favourite-modal-desktop-save']}>
        <button
          type="button"
          className={cx(
            `${styles['favourite-modal-desktop-button']} ${
              canSave() ? '' : styles.disabled
            }`,
          )}
          onClick={saveFavourite}
        >
          {saveText}
        </button>
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
};

export default DesktopModal;
