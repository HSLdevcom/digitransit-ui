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
    return linkPart ? <>{linkPart}</> : undefined;
  };

  const body = bodyContent => {
    const message = bodyContent
      .reduce((previous, contentElement) => {
        if (contentElement.type === 'text') {
          return [...previous, getTextElement(contentElement)];
        }
        if (contentElement.type === 'a') {
          return [...previous, getLinkElement(contentElement)];
        }
        return [...previous];
      }, [])
      .filter(element => element !== undefined);

    return (
      message.length > 0 && (
        <TruncatedMessage
          key={Math.random()}
          lines={2}
          message={message}
          className="message-bar-text"
          truncate={truncate}
          onShowMore={onShowMore}
        />
      )
    );
  };

  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
  return (
    <div
      className="message-content"
      tabIndex={0}
      aria-hidden="true"
      role="button"
      style={{ color: textColor, whiteSpace: 'pre' }}
    >
      <div className="message-heading">
        {heading(
          content.find(part => part.type === 'heading'),
          textColor,
        )}
      </div>
      {body(content)}
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
