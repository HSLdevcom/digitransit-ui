/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './mobile.scss';

const MobileModal = ({
  closeModal,
  headerText,
  renderList,
  closeArialLabel,
}) => {
  return (
    <div className={styles['favourite-edit-modal-mobile-container']}>
      <div className={styles['favourite-edit-modal-mobile-top']}>
        <button
          className={styles['favourite-edit-modal-mobile-back']}
          type="button"
          onClick={closeModal}
          aria-label={closeArialLabel}
        >
          <Icon img="arrow" />
        </button>
        <div className={styles['favourite-edit-modal-mobile-header']}>
          {headerText}
        </div>
      </div>
      {renderList}
    </div>
  );
};

MobileModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  headerText: PropTypes.string.isRequired,
  renderList: PropTypes.func.isRequired,
  closeArialLabel: PropTypes.string.isRequired,
};

export default MobileModal;
