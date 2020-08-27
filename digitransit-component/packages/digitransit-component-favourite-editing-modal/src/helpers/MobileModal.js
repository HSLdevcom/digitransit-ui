/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './mobile.scss';

const MobileModal = ({ headerText, renderList }) => {
  return (
    <div className={styles['favourite-edit-modal-mobile-container']}>
      <div className={styles['favourite-edit-modal-mobile-top']}>
        <div className={styles['favourite-edit-modal-mobile-header']}>
          {headerText}
        </div>
      </div>
      {renderList}
    </div>
  );
};

MobileModal.propTypes = {
  headerText: PropTypes.string.isRequired,
  renderList: PropTypes.func.isRequired,
};

export default MobileModal;
