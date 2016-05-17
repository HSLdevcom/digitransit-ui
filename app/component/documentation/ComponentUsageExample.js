import React, { PropTypes } from 'react';
import toPairs from 'lodash/toPairs';
/*
  Renders the components given as children. In addition a string represenation
  of the given components and its props are given.
  Can be combined with ComponentDocumentation

  usage:
  <ComponentUsageExample description="description of the example">
    <YourComponent foo=bar className="padding-normal"/>
  </ComponentUsageExample>
*/


function getPropStrings(props) {
  return toPairs(props).map(([key, value]) => {
    switch (typeof value) {
      case 'string':
        if (key !== 'children') {
          return `${key}='${value}'`;
        }
        return '';
      case 'object':
        return `${key}={${toPairs(value).map(([innerKey, innerValue]) =>
          `${innerKey}:${innerValue}`
        ).join(', ')}}`;
      default:
        return `${key}={${value}}`;
    }
  }).join(' ');
}

function getChild(child) {
  return (
    <div>
      <span className="code">
        {`<${child.type.displayName || child.type.name} ${getPropStrings(child.props)}/>`}
      </span>
      <div className="component border-dashed">
        {child}
      </div>
    </div>
  );
}

export default function ComponentUsageExample({ description, children }) {
  let wrappedDescription = '';

  if (description) {
    wrappedDescription = <p>{description}</p>;
  }

  return (
    <div className="component-example padding-vertical-normal">
      {wrappedDescription}{React.Children.map(children, child => getChild(child))}
    </div>
  );
}

ComponentUsageExample.propTypes = {
  description: PropTypes.node,
  children: PropTypes.node,
};
