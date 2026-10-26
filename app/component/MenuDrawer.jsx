import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import Modal from 'react-modal';
import { CloseButton } from '@hsl-fi/layout-primitives';
import { useConfigContext } from '../hooks/ConfigContext';

export default function MenuDrawer({
  open,
  children,
  onRequestChange,
  breakpoint,
  className = '',
  closeLabel = '',
}) {
  const config = useConfigContext();
  useEffect(() => Modal.setAppElement(document.querySelector('#app')), []);
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
      <CloseButton
        className="menu-drawer-close"
        lang={config.language}
        {...(closeLabel && { 'aria-label': closeLabel })}
        onClick={onRequestChange}
      />
      {children}
    </Modal>
  );
}

MenuDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onRequestChange: PropTypes.func.isRequired,
  breakpoint: PropTypes.string.isRequired,
  className: PropTypes.string,
  closeLabel: PropTypes.string,
};
