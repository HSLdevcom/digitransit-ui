import React, { PropTypes } from 'react';

/*
  Displays a card with the information of the given component as prop
  It renders the components propTypes and description

  usage:
  <ComponentDocumentation component=YourComponent>
  </ComponentDocumentation>
*/

const getName = (component) => component.displayName || component.name || 'Unknown';

const getDescription = (component) => {
  if (component.description) return component.description;
  return <div>Component {getName(component)} has no description</div>;
};


export default function ComponentDocumentation({ component, children }) {
  return (
    <div
      className="card padding-normal"
      id={getName(component)}
    >
      <h2>{getName(component)}</h2>
      <div>{getDescription(component)}</div>
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
