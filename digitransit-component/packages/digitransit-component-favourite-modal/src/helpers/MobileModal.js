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
  normalColor,
  hoverColor,
}) => {
  return (
    <div className={styles['favourite-modal-mobile-container']}>
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
          style={{
            '--normal-color': `${normalColor}`,
            '--hover-color': `${hoverColor}`,
          }}
          onClick={saveFavourite}
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
  normalColor: PropTypes.string,
  hoverColor: PropTypes.string,
};

MobileModal.defaultProps = {
  normalColor: '#007ac9',
  hoverColor: '#0062a1',
};

export default MobileModal;
