import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import NaviMessage from './NaviMessage';
import { Transfer } from './NaviUtils';
import { configShape } from '../../../util/shapes';
import { durationToString } from '../../../util/timeUtils';

const NaviStack = ({ messages, handleRemove }, { config }) => {
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
            time: durationToString(message.duration),
          }}
        />
      );
    }
    return message.body;
  };
  return (
    <div className={cx('info-stack', 'slide-in')}>
      {messages.map((notification, index) => (
        <NaviMessage
          key={notification.id}
          severity={notification.severity}
          index={index}
          handleRemove={handleRemove}
          hideClose={notification.hideClose}
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
};

NaviMessage.contextTypes = {
  config: configShape.isRequired,
};
export default NaviStack;
