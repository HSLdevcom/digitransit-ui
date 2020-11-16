/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styles from './desktop.scss';

const DesktopModal = ({
  headerText,
  autosuggestComponent,
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
  normalColor,
  hoverColor,
}) => {
  return (
    <div className={styles['favourite-modal-desktop-container']}>
      <div className={styles['favourite-modal-desktop-top']}>
        <div className={styles['favourite-modal-desktop-header']}>
          {headerText}
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
          style={{
            '--normal-color': `${normalColor}`,
            '--hover-color': `${hoverColor}`,
          }}
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
            style={{
              '--normal-color': `${normalColor}`,
              '--hover-color': `${hoverColor}`,
            }}
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
  autosuggestComponent: PropTypes.node.isRequired,
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
  normalColor: PropTypes.string,
  hoverColor: PropTypes.string,
};

DesktopModal.defaultProps = {
  isEdit: false,
  cancelSelected: () => ({}),
  normalColor: '#007ac9',
  hoverColor: '#0062a1',
};

export default DesktopModal;
