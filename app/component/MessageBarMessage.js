import PropTypes from 'prop-types';
import React from 'react';

import TruncatedMessage from './TruncatedMessage';

const MessageBarMessage = ({
  content,
  textColor,
  truncate,
  onShowMore,
  config,
}) => {
  const heading = (e, color) => {
    if (config.showAlertHeader && e?.type === 'heading') {
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

  const headingContent = heading(
    content.find(part => part.type === 'heading'),
    textColor,
  );
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
  return (
    <div className="message-content" style={{ color: textColor }}>
      {headingContent && (
        <div className="message-heading">{headingContent}</div>
      )}
      {body(
        content.find(part => part.type === 'text'),
        content.find(part => part.type === 'a'),
      )}
    </div>
  );
};

MessageBarMessage.propTypes = {
  content: PropTypes.array,
  textColor: PropTypes.string,
  truncate: PropTypes.bool,
  onShowMore: PropTypes.func,
  config: PropTypes.object,
};

export default MessageBarMessage;
