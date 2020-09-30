/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './modal-content.scss';

const ModalContent = ({ headerText, renderList }) => {
  return (
    <div className={styles['favourite-edit-modal-content-container']}>
      <div className={styles['favourite-edit-modal-content-top']}>
        <div className={styles['favourite-edit-modal-content-header']}>
          {headerText}
        </div>
      </div>
      {renderList()}
    </div>
  );
};

ModalContent.propTypes = {
  headerText: PropTypes.string.isRequired,
  renderList: PropTypes.func.isRequired,
};

export default ModalContent;
