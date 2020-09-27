/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './desktop.scss';

const DesktopModal = ({ headerText, renderList }) => {
  return (
    <div className={styles['favourite-edit-modal-desktop-container']}>
      <div className={styles['favourite-edit-modal-desktop-top']}>
        <div className={styles['favourite-edit-modal-desktop-header']}>
          {headerText}
        </div>
      </div>
      {renderList}
    </div>
  );
};

DesktopModal.propTypes = {
  headerText: PropTypes.string.isRequired,
  renderList: PropTypes.func.isRequired,
};

export default DesktopModal;
