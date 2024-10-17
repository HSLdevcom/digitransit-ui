import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import NaviMessage from './NaviMessage';

// eslint-disable-next-line no-unused-vars
const NaviStack = ({ messages, handleRemove, show }) => {
  return (
    <div className={cx('info-stack', !show ? 'slide-out' : 'slide-in')}>
      {messages.map((notification, index) => (
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
  // eslint-disable-next-line
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  show: PropTypes.bool.isRequired,
  handleRemove: PropTypes.func.isRequired,
};
export default NaviStack;
