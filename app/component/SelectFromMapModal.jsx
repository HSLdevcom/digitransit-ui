import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { Modal, ModalContent } from '@hsl-fi/dialog';

/**
 * Full-bleed wrapper around the HSL design system's Modal/ModalContent,
 * used to host the "select location from map" picker. The design system's
 * Modal is a compact, content-sized card (max-width 560px, padded), but the
 * map picker needs to fill essentially the whole viewport for usable marker
 * placement. The library exposes no prop to change the overlay/sheet sizing,
 * and those ancestor elements use hashed CSS-module classnames we can't
 * target by class name from outside, so the callback ref below tags them
 * with our own stable classnames (see select-from-map-modal.scss) the first
 * time the content mounts.
 */
export default function SelectFromMapModal({
  title,
  lang,
  onClose,
  children = null,
}) {
  const setContentRef = useCallback(node => {
    if (!node) {
      return;
    }
    const scaler = node.parentElement;
    const overlay = scaler?.parentElement;
    scaler?.classList.add('select-from-map-modal-scaler');
    overlay?.classList.add('select-from-map-modal-overlay');
  }, []);

  return (
    <Modal
      lang={lang}
      open
      onOpenChange={open => {
        if (!open) {
          onClose();
        }
      }}
    >
      <ModalContent
        ref={setContentRef}
        title={title}
        lang={lang}
        className="select-from-map-modal-content"
      >
        {children}
      </ModalContent>
    </Modal>
  );
}

SelectFromMapModal.propTypes = {
  title: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};
