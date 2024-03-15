import PropTypes from 'prop-types';
import React from 'react';
import TruncatedMessage from './TruncatedMessage';

export default function MessageBarMessage(
  { content, textColor, truncate, onShowMore },
  { config },
) {
  const heading = (e, color) => {
    if (config.showAlertHeader && e?.type === 'heading') {
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

    return (
      <TruncatedMessage
        lines={2}
        message={bodyContent}
        className="message-bar-text"
        truncate={truncate}
        onShowMore={onShowMore}
      />
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
}

MessageBarMessage.propTypes = {
  content: PropTypes.arrayOf(PropTypes.object).isRequired,
  textColor: PropTypes.string,
  truncate: PropTypes.bool,
  onShowMore: PropTypes.func.isRequired,
};

MessageBarMessage.defaultProps = {
  textColor: undefined,
  truncate: false,
};

MessageBarMessage.contextTypes = {
  config: PropTypes.object.isRequired,
};
