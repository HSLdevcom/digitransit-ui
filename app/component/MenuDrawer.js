import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'react-modal';

function MenuDrawer({ open, children, onRequestChange }) {
  const classNames = {
    base: 'mobile-menu-content',
    afterOpen: 'mobile-menu-content-open',
    beforeClose: 'mobile-menu-content-close',
  };
  const overlayClassNames = {
    base: 'mobile-menu-background',
    afterOpen: 'mobile-menu-background-open',
    beforeClose: 'mobile-menu-background-close',
  };
  return (
    <Modal
      isOpen={open}
      closeTimeoutMS={450}
      className={classNames}
      overlayClassName={overlayClassNames}
      onRequestClose={onRequestChange}
    >
      {children}
    </Modal>
  );
}
MenuDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  children: PropTypes.node,
  onRequestChange: PropTypes.func,
};

export default MenuDrawer;
