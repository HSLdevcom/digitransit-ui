/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './mobile.scss';

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
    <div className={styles['favourite-modal-mobile-container']}>
      <div className={styles['favourite-modal-mobile-top']}>
        <button
          className={styles['favourite-modal-mobile-back']}
          type="button"
          onClick={closeModal}
          aria-label={closeArialLabel}
        >
          <Icon img="arrow" />
        </button>
        <div className={styles['favourite-modal-mobile-header']}>
          {headerText}
        </div>
      </div>
      <div className={styles['favourite-modal-mobile-main']}>
        <div className={styles['favourite-modal-mobile-location-search']}>
          {autosuggestComponent}
        </div>
        <div className={styles['favourite-modal-mobile-name']}>
          <input
            className={styles['favourite-modal-mobile-input']}
            value={name || ''}
            placeholder={inputPlaceholder}
            onChange={specifyName}
          />
        </div>
      </div>
      <div className={styles['favourite-modal-mobile-text']}>
        {chooseIconText}
      </div>
      <div className={styles['favourite-modal-mobile-icons']}>
        {favouriteIconTable}
      </div>
      <div className={styles['favourite-modal-mobile-save']}>
        <button
          type="button"
          className={cx(
            `${styles['favourite-modal-mobile-button']} ${
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
