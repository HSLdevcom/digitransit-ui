import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@hsl-fi/modal';
import styles from './styles.scss';

export default function AllModesModal({
  appElement,
  modalOpen,
  closeModal,
  isMobile,
  language,
  fontWeights,
  colors,
  children,
}) {
  const [t] = useTranslation();

  return (
    <Modal
      appElement={appElement}
      closeButtonLabel={(t('close'), { lng: language })}
      variant={isMobile ? 'large' : 'small'}
      isOpen={modalOpen}
      onCrossClick={closeModal}
    >
      <div
        className={styles['near-you-container']}
        style={{ '--font-weight': fontWeights.medium }}
      >
        <h2 className={styles['near-you-title']}>
          {t('title', { lng: language })}
        </h2>
        {!isMobile && (
          <div className={styles['modal-desc']}>
            {t('description', { lng: language })}
          </div>
        )}
        <div style={{ height: '20px' }} />
        <div className={styles['near-you-buttons-container-wide']}>
          {children}
        </div>
        {!isMobile && (
          <div
            key=""
            className={styles.separator}
            style={{ '--margin': '-12%', '--width': '124%' }}
          />
        )}
        <div className={styles['close-container']}>
          <button
            type="button"
            onClick={closeModal}
            className={isMobile ? styles['close-mobile'] : styles.close}
            style={{ '--color': colors.primary }}
          >
            {t('close', { lng: language })}
          </button>
        </div>
      </div>
    </Modal>
  );
}

AllModesModal.propTypes = {
  appElement: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  modalOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  fontWeights: PropTypes.shape({ medium: PropTypes.number }).isRequired,
  colors: PropTypes.objectOf(PropTypes.string).isRequired,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};
