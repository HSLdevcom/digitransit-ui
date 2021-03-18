import PropTypes from 'prop-types';
import React from 'react';
import { v4 as uuid } from 'uuid';
import { intlShape } from 'react-intl';

const MessageBarMessage = (
  { content, onMaximize, textColor, maximized },
  { intl },
) => {
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
      return <span>{e.content}</span>;
    }
    return null;
  };

  // eslint-disable-next-line no-unused-vars
  const a = (e, key, color) => {
    if (e.type === 'a' && e.href && maximized) {
      return (
        <span>
          {` ${intl.formatMessage({
            id: 'read-more',
            defaultMessage: 'Read more',
          })}:`}
          <a
            className="message-bar-link"
            key={`${key}-link`}
            href={e.href}
            style={{ color: e.color || null }}
          >
            {e.href}
          </a>
        </span>
      );
    }
    return null;
  };

  const elements = [heading, span, a];

  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
  return (
    <div
      className={`message-content ${maximized ? 'maximized' : 'hideContent'}`}
      tabIndex={0}
      aria-hidden="true"
      role="button"
      onClick={onMaximize}
      style={{ color: textColor }}
    >
      {content.map((fragment, i) =>
        elements.map(t => t(fragment, i, textColor, maximized)),
      )}
      {!maximized && (
        <button type="button" onClick={onMaximize}>
          Näytä lisää
        </button>
      )}
    </div>
  );
};

MessageBarMessage.propTypes = {
  content: PropTypes.array,
  onMaximize: PropTypes.func.isRequired,
  textColor: PropTypes.string,
  maximized: PropTypes.bool,
};

MessageBarMessage.contextTypes = {
  intl: intlShape,
};

export default MessageBarMessage;
