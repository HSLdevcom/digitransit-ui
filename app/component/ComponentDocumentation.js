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

const getDescription = (component, onlyComponent) => {
  if (isFunction(component.description)) return component.description(onlyComponent);
  else if (component.description) return component.description;
  return <div>Component {getName(component)} has no description</div>;
};

export default class ComponentDocumentation extends React.Component {

  static childContextTypes = {
    componentOnly: React.PropTypes.bool,
  }

  getChildContext = function getChildContext() {
    return {
      componentOnly: this.props.mode === 'examples-only',
    };
  }

  render() {
    if (this.props.mode === 'examples-only') {
      return <div className="component-example-container">{getDescription(this.props.component)}</div>;
    }
    return (
      <div
        className="card padding-normal"
        id={getName(this.props.component)}
      >
        <h2>{getName(this.props.component)}</h2>
        <div>{getDescription(this.props.component)} </div>
        <p>Required props:</p>
        <ul>{Object.keys(this.props.component.propTypes || {}).filter(key =>
        !this.props.component.propTypes[key].isRequired,
      ).map(key => <li key={key} >{key}</li>)}</ul>
        <p>Optional props:</p>
        <ul>{Object.keys(this.props.component.propTypes || {}).filter(key =>
        this.props.component.propTypes[key].isRequired,
      ).map(key => <li key={key} >{key}</li>)}</ul>
        <p>Default props:</p>
        <ul>{Object.keys(this.props.component.defaultProps || {}).map(key => <li key={key} >
          {key}={JSON.stringify(this.props.component.defaultProps[key])}</li>)}</ul>
        {this.props.children}
      </div>
    );
  }
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
  mode: PropTypes.string,
  children: PropTypes.node,
};
