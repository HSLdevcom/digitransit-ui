import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import { Text } from '@hsl-fi/layout-primitives';
import styles from './styles.scss';

export default function AllModesModal({
  modalOpen,
  closeModal,
  language,
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
        description={
          <Text variant="paragraph-small" fixedSize="desktop" color="default">
            {t('description', { lng: language })}
          </Text>
        }
        buttons={[
          {
            children: t('close', { lng: language }),
            variant: 'primary',
            onClick: closeModal,
          },
        ]}
      >
        <div
          className={`${styles['near-you-container']} ${styles['modal-rows']}`}
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
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};
