/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './desktop.scss';

const DesktopModal = ({
  closeModal,
  headerText,
  renderList,
  closeArialLabel,
}) => {
  return (
    <div className={styles['favourite-edit-modal-desktop-container']}>
      <div className={styles['favourite-edit-modal-desktop-top']}>
        <div className={styles['favourite-edit-modal-desktop-header']}>
          {headerText}
        </div>
        <div
          className={styles['favourite-edit-modal-desktop-close']}
          role="button"
          tabIndex="0"
          onClick={closeModal}
          aria-label={closeArialLabel}
        >
          <Icon img="close" />
        </div>
      </div>
      <div className={styles['favourite-modal-desktop-main']}>{renderList}</div>
    </div>
  );
};

DesktopModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  headerText: PropTypes.string.isRequired,
  renderList: PropTypes.func.isRequired,
  closeArialLabel: PropTypes.string.isRequired,
};

export default DesktopModal;
