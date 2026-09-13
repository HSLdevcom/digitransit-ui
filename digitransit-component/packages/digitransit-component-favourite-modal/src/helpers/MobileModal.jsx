/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styles from './mobile.scss';

const MobileModal = ({
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
  color,
  hoverColor,
  savePlaceText,
  cantSaveText,
  requiredText,
  fontWeights,
}) => {
  return (
    <div
      className={styles['favourite-modal-mobile-container']}
      style={{
        '--color': `${color}`,
        '--hover-color': `${hoverColor}`,
        '--font-weight-medium': fontWeights.medium,
      }}
    >
      <div className={styles['favourite-modal-mobile-top']}>
        <div className={styles['favourite-modal-mobile-header']}>
          {headerText}
        </div>
      </div>
      <div className={styles['favourite-modal-mobile-main']}>
        <div className={styles['favourite-modal-mobile-location-search']}>
          {autosuggestComponent}
        </div>
        <input
          className={styles['favourite-modal-mobile-input']}
          value={name || ''}
          placeholder={inputPlaceholder}
          onChange={specifyName}
        />
      </div>
      <div className={styles['favourite-modal-mobile-text']}>
        {chooseIconText}
        <p className={styles['sr-only']}>{requiredText}</p>
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
          aria-label={`${canSave() ? savePlaceText : cantSaveText}`}
        >
          {saveText}
        </button>
      </div>
    </div>
  );
};

MobileModal.propTypes = {
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
  color: PropTypes.string.isRequired,
  hoverColor: PropTypes.string.isRequired,
  savePlaceText: PropTypes.string.isRequired,
  cantSaveText: PropTypes.string.isRequired,
  requiredText: PropTypes.string.isRequired,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number.isRequired,
  }).isRequired,
};

export default MobileModal;
