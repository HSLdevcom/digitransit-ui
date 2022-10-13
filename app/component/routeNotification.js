import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { intlShape } from 'react-intl';
import { getDialogState, setDialogState } from '../store/localStorage';

import Icon from './Icon';

const RouteNotification = (props, context) => {
  const [hideNote, setHideNote] = useState(true);

  useEffect(() => {
    setHideNote(getDialogState(props.id) || false);
  }, []);

  useEffect(() => {
    setDialogState(props.id, hideNote);
  }, [hideNote]);

  return (
    <div className={`route-notification ${hideNote ? 'minimized' : ' '}`}>
      <div className="left-block">
        <Icon
          img="icon-icon_info"
          className="route-notification-icon"
          color={context.config.colors.primary}
        />
      </div>
      <div className="right-block">
        <h3>{props.header}</h3>
        {!hideNote && (
          <>
            <ul>
              {props.content.map(bulletpoint => (
                <li key={bulletpoint}>{bulletpoint}</li>
              ))}
            </ul>
            <a
              className="route-notification-link"
              href={`https://www.${props.link}`}
            >
              {props.link}
            </a>
          </>
        )}
      </div>
      <div className="button-block">
        {hideNote && (
          <label htmlFor="route-notification-collapse-button">
            {props.closeButtonLabel}
          </label>
        )}
        <button
          type="button"
          id="route-notification-collapse-button"
          className="route-notification-collapse-button"
          onClick={() => {
            setHideNote(!hideNote);
          }}
          aria-label={
            hideNote
              ? context.intl.formatMessage({
                  id: 'notification-open',
                  defaultMessage: 'Open message',
                })
              : context.intl.formatMessage({
                  id: 'notification-minimize',
                  defaultMessage: 'Close message',
                })
          }
        >
          <Icon
            img="icon-icon_arrow-dropdown"
            color={context.config.colors.primary}
            className={`route-notification-collapse-icon ${
              !hideNote ? 'inverted' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
};

RouteNotification.propTypes = {
  header: PropTypes.string.isRequired,
  content: PropTypes.array.isRequired,
  link: PropTypes.string,
  id: PropTypes.string.isRequired,
  closeButtonLabel: PropTypes.string,
};

RouteNotification.defaultProps = {
  link: '',
};

RouteNotification.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default RouteNotification;
