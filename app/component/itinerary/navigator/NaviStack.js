import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import NaviMessage from './NaviMessage';
import { Transfer } from './NaviUtils';
import { configShape } from '../../../util/shapes';
import Duration from '../Duration';

const NaviStack = ({ messages, handleRemove, cardAnimation }, { config }) => {
  const getMessageBody = message => {
    if (message.alertContent) {
      return message.alertContent;
    }
    if (message.transferTimeChanged) {
      return (
        <FormattedMessage
          id="navigation-hurry-transfer-value"
          values={{
            transfer: Transfer(message.route1, message.route2, config),
            time: <Duration duration={message.transferDuration} />,
            change: Math.floor(
              (message.transferDuration - message.originalTransferDuration) /
                60000,
            ),
          }}
        />
      );
    }
    return message.body;
  };
  return (
    <div
      className={cx('info-stack', cardAnimation)}
      aria-live="polite"
      role="status"
    >
      {messages.map((notification, index) => (
        <NaviMessage
          key={notification.id}
          severity={notification.severity}
          index={index}
          handleRemove={handleRemove}
          hideClose={notification.hideClose}
          cardAnimation={cardAnimation}
        >
          <div className="navi-info-content">
            <span className="notification-header">{notification.title}</span>
            {getMessageBody(notification)}
          </div>
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

NaviMessage.contextTypes = {
  config: configShape.isRequired,
};
export default NaviStack;
