import React from 'react';
import PropTypes from 'prop-types';
import { IntlContext } from 'react-intl';

/**
 * Publishes the react-intl v3 IntlContext value into the legacy React
 * childContextTypes API so that class components accessing this.context.intl
 * continue to work without modification.
 */
class IntlBridge extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  static contextType = IntlContext;

  static childContextTypes = {
    intl: PropTypes.object,
  };

  getChildContext() {
    return { intl: this.context };
  }

  render() {
    return this.props.children;
  }
}

export default IntlBridge;
