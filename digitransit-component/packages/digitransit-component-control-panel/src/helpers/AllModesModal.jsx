import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import styles from './styles.scss';

export default function AllModesModal({
  modalOpen,
  closeModal,
  language,
  fontWeights,
  children,
}) {
  const [t] = useTranslation();

  return (
    <Modal
      lang={language}
      open={modalOpen}
      onOpenChange={open => {
        if (!open) {
          closeModal();
        }
      }}
    >
      <ModalContent
        lang={language}
        title={t('title', { lng: language })}
        description={t('description', { lng: language })}
        buttons={[
          {
            children: t('close', { lng: language }),
            variant: 'secondary',
            onClick: closeModal,
          },
        ]}
      >
        <div
          className={styles['near-you-container']}
          style={{ '--font-weight': fontWeights.medium }}
        >
          <div className={styles['near-you-buttons-container-wide']}>
            {children}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

AllModesModal.propTypes = {
  language: PropTypes.string.isRequired,
  modalOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  fontWeights: PropTypes.shape({ medium: PropTypes.number }).isRequired,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};
