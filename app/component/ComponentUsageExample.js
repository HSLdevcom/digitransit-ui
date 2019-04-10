import PropTypes from 'prop-types';
import React from 'react';
import toPairs from 'lodash/toPairs';
import toString from 'lodash/toString';
import { isBrowser } from '../util/browser';
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
  return toPairs(props)
    .map(([key, value]) => {
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
    })
    .join(' ');
}

function getChild(child) {
  return (
    <div>
      <span className="code">
        {`<${child.type.displayName || child.type.name} ${getPropStrings(
          child.props,
        )}/>`}
      </span>
      <div className="component border-dashed">{child}</div>
    </div>
  );
}

export default function ComponentUsageExample(
  { description, children, isFullscreen },
  { componentOnly },
) {
  if (!isBrowser) {
    return null;
  }

  if (componentOnly) {
    const style = isFullscreen
      ? {
          height: '100vh',
          margin: '-75px -25px',
          position: 'relative',
          width: '100vw',
        }
      : {};
    return (
      <div className="component-example component-example-large-vertical-padding">
        <div className="component" style={style}>
          {children}
        </div>
      </div>
    );
  }

  let wrappedDescription = '';

  if (description) {
    wrappedDescription = <p>{description}</p>;
  }

  return (
    <div className="component-example padding-vertical-normal">
      {wrappedDescription}
      {React.Children.map(children, child => getChild(child))}
    </div>
  );
}

ComponentUsageExample.propTypes = {
  description: PropTypes.node,
  children: PropTypes.node,
  isFullscreen: PropTypes.bool,
};

ComponentUsageExample.defaultProps = {
  isFullscreen: false,
};

ComponentUsageExample.contextTypes = {
  componentOnly: PropTypes.bool,
};
