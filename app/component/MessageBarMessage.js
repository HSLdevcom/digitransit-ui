import PropTypes from 'prop-types';
import React from 'react';

import TruncatedMessage from './TruncatedMessage';

const MessageBarMessage = ({ content, textColor, truncate, onShowMore }) => {
  const heading = (e, color) => {
    if (e?.type === 'heading') {
      return <h2 style={{ color }}>{e.content}</h2>;
    }
    return null;
  };

  const body = bodyContent => {
    return (
      <TruncatedMessage
        key={Math.random()}
        lines={2}
        message={bodyContent}
        className="message-bar-text"
        truncate={truncate}
        onShowMore={onShowMore}
      />
    );
  };

  const getTextElement = text => {
    const textPart = text && text.content;
    return <>{textPart}</>;
  };

  const getLinkElement = link => {
    const linkPart = link && link.href && (
      <span>
        <a
          className="message-bar-link"
          href={link.href}
          style={{ color: link.color || null }}
        >
          {link.content || link.href}
        </a>
      </span>
    );
    return <>{linkPart}</>;
  };

  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
  return (
    <div
      className="message-content"
      tabIndex={0}
      aria-hidden="true"
      role="button"
      style={{ color: textColor, 'white-space': 'pre' }}
    >
      <div className="message-heading">
        {heading(
          content.find(part => part.type === 'heading'),
          textColor,
        )}
      </div>
      {body(
        content.reduce((previous, contentElement) => {
          if (contentElement.type === 'text') {
            return [...previous, getTextElement(contentElement)];
          }
          if (contentElement.type === 'a') {
            return [...previous, getLinkElement(contentElement)];
          }
          return [...previous];
        }, []),
      )}
    </div>
  );
};

MessageBarMessage.propTypes = {
  content: PropTypes.array,
  textColor: PropTypes.string,
  truncate: PropTypes.bool,
  onShowMore: PropTypes.func,
};

export default MessageBarMessage;
