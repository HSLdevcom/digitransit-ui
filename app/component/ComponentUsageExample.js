import React, { PropTypes } from 'react';
import toPairs from 'lodash/toPairs';
import toString from 'lodash/toString';
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
        if (value === null) {
          return `${key}={null}`;
        }
        if (value.$$typeof) {
          // react component
          return `${key}={<${value.type.displayName || value.type.name}
            ${getPropStrings(value.props)}/>}`;
        }
        return `${key}={${getPropStrings(value)}}`;
      default:
        return `${key}={${toString(value)}}`;
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

export default function ComponentUsageExample({ description, children }, { componentOnly }) {
  if (componentOnly) {
    return (<div className="component-example component-example-large-vertical-padding">
      <div className="component">
        {children}
      </div>
    </div>);
  }

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

ComponentUsageExample.contextTypes = {
  componentOnly: PropTypes.bool,
};
