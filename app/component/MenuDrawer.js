import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'react-modal';

function MenuDrawer({
  open,
  children,
  onRequestChange,
  breakpoint,
  className,
}) {
  const classNames = {
    base: `${className} ${breakpoint !== 'large' ? 'mobile' : ''} menu-content`,
    afterOpen: 'menu-content-open',
    beforeClose: 'menu-content-close',
  };
  const overlayClassNames = {
    base: `${breakpoint !== 'large' ? 'mobile' : ''} menu-background`,
    afterOpen: 'menu-background-open',
    beforeClose: 'menu-background-close',
  };
  return (
    <Modal
      isOpen={open}
      closeTimeoutMS={450}
      className={classNames}
      overlayClassName={overlayClassNames}
      onRequestClose={onRequestChange}
      shouldFocusAfterRender={false}
    >
      {children}
    </Modal>
  );
}
MenuDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  children: PropTypes.node,
  onRequestChange: PropTypes.func,
  breakpoint: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default MenuDrawer;
