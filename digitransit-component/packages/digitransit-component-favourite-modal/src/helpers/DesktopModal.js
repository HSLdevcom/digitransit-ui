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
  color,
  hoverColor,
  savePlaceText,
  cantSaveText,
  requiredText,
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
          <p className={styles['sr-only']}>{requiredText}</p>
          {autosuggestComponent}
        </div>
        <div className={styles['favourite-modal-desktop-name']}>
          <input
            className={styles['favourite-modal-desktop-input']}
            value={name}
            placeholder={inputPlaceholder}
            onChange={specifyName}
            style={{
              '--color': `${color}`,
              '--hover-color': `${hoverColor}`,
            }}
          />
        </div>
      </div>
      <div className={styles['favourite-modal-desktop-text']}>
        {chooseIconText}
        <p className={styles['sr-only']}>{requiredText}</p>
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
            '--color': `${color}`,
            '--hover-color': `${hoverColor}`,
          }}
          onClick={saveFavourite}
          aria-label={`${canSave() ? savePlaceText : cantSaveText}`}
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
              '--color': `${color}`,
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
  color: PropTypes.string.isRequired,
  hoverColor: PropTypes.string.isRequired,
  savePlaceText: PropTypes.string.isRequired,
  cantSaveText: PropTypes.string.isRequired,
  requiredText: PropTypes.string.isRequired,
};

DesktopModal.defaultProps = {
  isEdit: false,
  cancelSelected: () => ({}),
};

export default DesktopModal;
