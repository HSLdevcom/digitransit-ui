import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import cx from 'classnames';

function MenuDrawer({ open, children, onRequestChange }) {
  const [visible, setVisible] = useState();

  useEffect(() => {
    setTimeout(
      () => {
        setVisible(open);
      },
      open ? 0 : 450,
    ); // 450ms animation
  }, [open]);

  return (
    <div
      className="offcanvas mobile-menu"
      style={{ visibility: visible ? 'visible' : 'hidden' }}
    >
      <div
        className={cx('menu-background', open ? 'open' : 'close')}
        onClick={() => {
          onRequestChange();
        }}
        aria-hidden="true"
      />
      <div className={cx('menu-content', open ? 'open' : 'close')}>
        {children}
      </div>
    </div>
  );
}
MenuDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  children: PropTypes.node,
  onRequestChange: PropTypes.func,
};

export default MenuDrawer;
