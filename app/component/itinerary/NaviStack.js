import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import NaviMessage from './NaviMessage';

// eslint-disable-next-line no-unused-vars
const NaviStack = ({ notifications, handleRemove, show }) => {
  return (
    <div className={cx('info-stack', !show ? 'slide-out' : 'slide-in')}>
      {notifications.map((notification, index) => (
        <NaviMessage
          key={notification.id}
          severity={notification.severity}
          index={index}
          handleRemove={handleRemove}
        >
          {notification.content}
        </NaviMessage>
      ))}
    </div>
  );
};

NaviStack.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      severity: PropTypes.string.isRequired,
    }),
  ).isRequired,
  show: PropTypes.bool.isRequired,
  handleRemove: PropTypes.func.isRequired,
};

export default NaviStack;
