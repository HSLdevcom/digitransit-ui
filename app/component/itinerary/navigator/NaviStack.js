import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import NaviMessage from './NaviMessage';

const NaviStack = ({ messages, handleRemove, cardAnimation }) => {
  return (
    <div className={cx('info-stack', cardAnimation)}>
      {messages.map((notification, index) => (
        <NaviMessage
          key={notification.id}
          severity={notification.severity}
          index={index}
          handleRemove={handleRemove}
          hideClose={notification.hideClose}
          cardAnimation={cardAnimation}
        >
          {notification.content}
        </NaviMessage>
      ))}
    </div>
  );
};

NaviStack.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      severity: PropTypes.string.isRequired,
    }),
  ).isRequired,
  handleRemove: PropTypes.func.isRequired,
  cardAnimation: PropTypes.string.isRequired,
};

export default NaviStack;
