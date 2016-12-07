import React, { PropTypes } from 'react';
import isFunction from 'lodash/isFunction';

/*
  Displays a card with the information of the given component as prop
  It renders the components propTypes and description

  usage:
  <ComponentDocumentation component=YourComponent>
  </ComponentDocumentation>
*/

const getName = component => component.displayName || component.name || 'Unknown';

const getDescription = (component) => {
  if (isFunction(component.description)) return component.description();
  else if (component.description) return component.description;
  return <div>Component {getName(component)} has no description</div>;
};


export default function ComponentDocumentation({ component, children }) {
  return (
    <div
      className="card padding-normal"
      id={getName(component)}
    >
      <h2>{getName(component)}</h2>
      <div>{getDescription(component)} </div>
      <p>Required props:</p>
      <ul>{Object.keys(component.propTypes || {}).filter(key =>
        !component.propTypes[key].isRequired,
      ).map(key => <li key={key} >{key}</li>)}</ul>
      <p>Optional props:</p>
      <ul>{Object.keys(component.propTypes || {}).filter(key =>
        component.propTypes[key].isRequired,
      ).map(key => <li key={key} >{key}</li>)}</ul>
      <p>Default props:</p>
      <ul>{Object.keys(component.defaultProps || {}).map(key => <li key={key} >
        {key}={JSON.stringify(component.defaultProps[key])}</li>)}</ul>
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
