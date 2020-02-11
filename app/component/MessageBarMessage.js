import PropTypes from 'prop-types';
import React from 'react';
import { uuid } from 'uuidv4';
import Icon from './Icon';

const heading = (e, key, color) => {
  if (e.type === 'heading') {
    return (
      <h2 key={`${key}-heading`} style={{ color }}>
        {e.content}
      </h2>
    );
  }
  return null;
};

// eslint-disable-next-line no-unused-vars
const span = (e, key, color) => {
  if (e.type === 'text') {
    if (e.content.includes('\n')) {
      const result = e.content
        .split('\n')
        .filter(item => item !== '')
        .map(item => {
          return (
            <span key={uuid()}>
              {item}
              <br />
            </span>
          );
        });
      return result;
    }
    return e.content;
  }
  return null;
};

// eslint-disable-next-line no-unused-vars
const a = (e, key, color) => {
  if (e.type === 'a' && e.href) {
    return (
      <a key={`${key}-link`} href={e.href} style={{ color: e.color || null }}>
        {e.content}
        <Icon className="message-bar-link-icon" img="icon-icon_external_link" />
      </a>
    );
  }
  return null;
};

const elements = [heading, span, a];

const renderContent = (content, textColor) =>
  content.map((fragment, i) => elements.map(t => t(fragment, i, textColor)));

/*
 * Renders message
 */
const MessageBarMessage = ({ content, onMaximize, textColor }) => (
  // TOOD: find out how this should be accessible
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
  <div
    tabIndex={0}
    role="button"
    onClick={onMaximize}
    style={{ color: textColor }}
  >
    {renderContent(content, textColor)}
  </div>
);

MessageBarMessage.propTypes = {
  content: PropTypes.array,
  onMaximize: PropTypes.func.isRequired,
  textColor: PropTypes.string,
};

export default MessageBarMessage;
