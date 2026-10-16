import PropTypes from 'prop-types';
import React from 'react';
import { Modal, ConfirmationModalContent } from '@hsl-fi/dialog';

/**
 * A confirmation dialog (e.g. "Are you sure you want to delete this?") built
 * on top of the HSL design system's Modal/ConfirmationModalContent. Button
 * styling (colors, typography) is handled entirely by the design system's
 * theme tokens, so it automatically follows the active deployment's theme.
 *
 * @example
 * <DialogModal />
 */
const DialogModal = ({
  headerText,
  dialogContent,
  handleClose = () => {},
  primaryButtonText,
  primaryButtonOnClick,
  primaryButtonVariant,
  secondaryButtonText,
  secondaryButtonOnClick,
  lang,
  isModalOpen,
}) => {
  return (
    <Modal
      lang={lang}
      open={isModalOpen}
      onOpenChange={open => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <ConfirmationModalContent
        title={headerText}
        description={dialogContent}
        confirmLabel={primaryButtonText}
        confirmVariant={primaryButtonVariant}
        onConfirm={primaryButtonOnClick}
        cancelLabel={secondaryButtonText}
        onCancel={secondaryButtonOnClick}
      />
    </Modal>
  );
};

DialogModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  headerText: PropTypes.string.isRequired,
  handleClose: PropTypes.func,
  primaryButtonText: PropTypes.string.isRequired,
  primaryButtonOnClick: PropTypes.func.isRequired,
  primaryButtonVariant: PropTypes.oneOf([
    'primary',
    'secondary',
    'success',
    'destructive',
    'plain',
  ]),
  secondaryButtonText: PropTypes.string,
  secondaryButtonOnClick: PropTypes.func,
  dialogContent: PropTypes.string,
  lang: PropTypes.string.isRequired,
};

export default DialogModal;
