import PropTypes from 'prop-types';
import React from 'react';

const heading = e => {
  if (e.type === 'heading') {
    return <h2>{e.content}</h2>;
  }
  return null;
};

const span = e => {
  if (e.type === 'text') {
    return e.content;
  }
  return null;
};

const a = e => {
  if (e.type === 'a') {
    return <a href={e.href}>{e.content}</a>;
  }
  return null;
};

const elements = [heading, span, a];

const renderContent = content =>
  content.map(fragment => elements.map(t => t(fragment)));

/*
 * Renders message
 */
const MessageBarMessage = ({ id, content, onMaximize }) => (
  // TOOD: find out how this should be accessible
  <div tabIndex={0} role="button" key={id} onClick={onMaximize}>
    {renderContent(content)}
  </div>
);

MessageBarMessage.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.array,
  onMaximize: PropTypes.func.isRequired,
};

export default MessageBarMessage;
