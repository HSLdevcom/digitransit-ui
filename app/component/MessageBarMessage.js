import PropTypes from 'prop-types';
import React from 'react';
import withBreakpoint from '../util/withBreakpoint';

import TruncatedMessage from './TruncatedMessage';

const MessageBarMessage = ({ content, textColor, breakpoint }) => {
  const heading = (e, color) => {
    if (e?.type === 'heading') {
      return <h2 style={{ color }}>{e.content}</h2>;
    }
    return null;
  };

  const body = (text, link) => {
    const textPart = text && text.content;
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
    const bodyContent = (
      <>
        {textPart}
        {linkPart}
      </>
    );

    if (breakpoint === 'large') {
      return bodyContent;
    }

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
      {heading(
        content.find(part => part.type === 'heading'),
        textColor,
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
  breakpoint: PropTypes.string.isRequired,
};

export default withBreakpoint(MessageBarMessage);
