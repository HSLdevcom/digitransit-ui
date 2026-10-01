import Modal from '@hsl-fi/modal';
import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const NavigatorModal = ({
  withBackdrop = false,
  isOpen = false,
  children,
  slideUp = false,
}) => {
  const overlayClass = cx('navigator-modal-container', {
    'navigator-modal-backdrop': withBackdrop,
  });

  const modalClass = cx('navigator-modal', {
    'slide-in': slideUp,
  });

  return (
    <Modal
      appElement="#app"
      isOpen={isOpen}
      className={modalClass}
      overlayClassName={overlayClass}
    >
      <div className="navigator-modal-content">{children}</div>
    </Modal>
  );
};

NavigatorModal.propTypes = {
  children: PropTypes.node,
  withBackdrop: PropTypes.bool,
  isOpen: PropTypes.bool,
  slideUp: PropTypes.bool,
};

export default NavigatorModal;
