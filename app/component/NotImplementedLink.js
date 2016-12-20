import React from 'react';
import { click } from '../action/notImplementedActions';
import ComponentUsageExample from './ComponentUsageExample';

class NotImplementedLink extends React.Component {
  static description = () =>
    <div>
      <p>Builds a link that opens a &lsquo;not implemented&rsquo; popup.</p>
      <p>
        The &lsquo;not implemented&rsquo; -popup can also be activated by sending a event through
        not-implemented-action#click
      </p>
      <ComponentUsageExample>
        <NotImplementedLink name="The promiseware">Promiseware</NotImplementedLink>
      </ComponentUsageExample>
    </div>

  static contextTypes = {
    executeAction: React.PropTypes.func.isRequired,
  };

  static propTypes = {
    name: React.PropTypes.node,
    nonTextLink: React.PropTypes.bool,
    className: React.PropTypes.string,
    children: React.PropTypes.node,
  };

  notImplemented = () => {
    this.context.executeAction(click, this.props.name);
    return false;
  }

  render() {
    return (
      <a onClick={this.notImplemented} className={this.props.className}>
        {!this.props.nonTextLink && this.props.name}
        {this.props.children}
      </a>
    );
  }
}

export default NotImplementedLink;
