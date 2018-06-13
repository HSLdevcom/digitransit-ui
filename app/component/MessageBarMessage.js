import PropTypes from 'prop-types';
import React from 'react';

const heading = (e, key) => {
  if (e.type === 'heading') {
    return <h2 key={`${key}-heading`}>{e.content}</h2>;
  }
  return null;
};

// eslint-disable-next-line no-unused-vars
const span = (e, key) => {
  if (e.type === 'text') {
    return e.content;
  }
  return null;
};

const a = (e, key) => {
  if (e.type === 'a') {
    return (
      <a key={`${key}-link`} href={e.href}>
        {e.content}
      </a>
    );
  }
  return null;
};

const elements = [heading, span, a];

const renderContent = content =>
  content.map((fragment, i) => elements.map(t => t(fragment, i)));

/*
 * Renders message
 */
const MessageBarMessage = ({ content, onMaximize }) => (
  // TOOD: find out how this should be accessible
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
  <div tabIndex={0} role="button" onClick={onMaximize}>
    {renderContent(content)}
  </div>
);

MessageBarMessage.propTypes = {
  content: PropTypes.array,
  onMaximize: PropTypes.func.isRequired,
};

export default MessageBarMessage;
