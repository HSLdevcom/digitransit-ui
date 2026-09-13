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
  fontWeights,
}) => {
  return (
    <div
      className={styles['favourite-modal-desktop-container']}
      style={{
        '--color': `${color}`,
        '--hover-color': `${hoverColor}`,
        '--font-weight-medium': fontWeights.medium,
      }}
    >
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
            aria-label={inputPlaceholder}
            className={styles['favourite-modal-desktop-input']}
            value={name}
            placeholder={inputPlaceholder}
            onChange={specifyName}
          />
        </div>
      </div>
      <fieldset className={styles['icons-container']}>
        <legend className={styles['favourite-modal-desktop-text']}>
          {chooseIconText}
          <p className={styles['sr-only']}>{requiredText}</p>
        </legend>
        <div className={styles['favourite-modal-desktop-icons']}>
          {favouriteIconTable}
        </div>
      </fieldset>
      <div className={styles['favourite-modal-desktop-buttons']}>
        <button
          type="button"
          className={cx(
            `${styles['favourite-modal-desktop-button']} ${styles.save} ${
              canSave() ? '' : styles.disabled
            }`,
          )}
          onClick={saveFavourite}
          aria-label={`${canSave() ? savePlaceText : cantSaveText}`}
          aria-disabled={!canSave()}
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
  fontWeights: PropTypes.shape({
    medium: PropTypes.number.isRequired,
  }).isRequired,
};

DesktopModal.defaultProps = {
  isEdit: false,
  cancelSelected: () => ({}),
};

export default DesktopModal;
