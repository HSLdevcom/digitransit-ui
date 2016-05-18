import React, { PropTypes } from 'react';

/*
  Displays a card with the information of the given component as prop
  It renders the components propTypes and description

  usage:
  <ComponentDocumentation component=YourComponent>
  </ComponentDocumentation>
*/

export default function ComponentDocumentation({ component, children }) {
  return (
    <div
      className="card padding-normal"
      id={component.displayName || component.name}
    >
      <h2>{component.displayName || component.name}</h2>
      <div>{component.description}</div>
      <p>Props:</p>
      <ul>{Object.keys(component.propTypes || {}).map(key => <li key={key}>{key}</li>)}</ul>
      {children}
    </div>
  );
}

ComponentDocumentation.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      description: PropTypes.node.isRequired,
      propTypes: PropTypes.object,
    }).isRequired,
    PropTypes.func.isRequired,
  ]),
  children: PropTypes.node,
};
