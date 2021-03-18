import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { intlShape } from 'react-intl';

import TruncatedMessage from './TruncatedMessage';

const MessageBarMessage = ({ content, textColor }, { intl }) => {
  const [isMaximized, setMaximized] = useState(false);

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
      return (
        <TruncatedMessage
          lines={2}
          message={e.content}
          className="message-bar-text"
          onExpand={setMaximized}
        />
      );
    }
    return null;
  };

  // eslint-disable-next-line no-unused-vars
  const a = (e, key, color) => {
    if (e.type === 'a' && e.href && isMaximized) {
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
      className="message-content"
      tabIndex={0}
      aria-hidden="true"
      role="button"
      style={{ color: textColor }}
    >
      {content.map((fragment, i) =>
        elements.map(t => t(fragment, i, textColor, isMaximized)),
      )}
    </div>
  );
};

MessageBarMessage.propTypes = {
  content: PropTypes.array,
  textColor: PropTypes.string,
};

MessageBarMessage.contextTypes = {
  intl: intlShape,
};

export default MessageBarMessage;
