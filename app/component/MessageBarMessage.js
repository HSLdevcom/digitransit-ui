import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import TruncatedMessage from './TruncatedMessage';

const MessageBarMessage = ({ content, textColor }, { intl }) => {
  const heading = (e, key, color) => {
    if (e.type === 'heading') {
      return <h2 style={{ color }}>{e.content}</h2>;
    }
    return null;
  };

  const body = (text, link) => {
    const textPart = text && text.content;
    const linkPart = link && link.href && (
      <span>
        {` ${intl.formatMessage({
          id: 'read-more',
          defaultMessage: 'Read more',
        })}:`}
        <a
          className="message-bar-link"
          href={link.href}
          style={{ color: link.color || null }}
        >
          {link.href}
        </a>
      </span>
    );
    const bodyContent = (
      <>
        {textPart}
        {linkPart}
      </>
    );

    return (
      <TruncatedMessage
        lines={2}
        message={bodyContent}
        className="message-bar-text"
      />
    );
  };

  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
  return (
    <div
      className="message-content"
      tabIndex={0}
      aria-hidden="true"
      role="button"
      style={{ color: textColor }}
    >
      {heading(content[0], textColor)}
      {body(content[1] || undefined, content[2] || undefined)}
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
