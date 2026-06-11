import PropTypes from 'prop-types';
import React from 'react';

import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import NetworkError from './NetworkError';
import isRelayNetworkError from '../util/relayUtils';

export default class ErrorBoundary extends React.Component {
  static propTypes = { children: PropTypes.node.isRequired };

  state = { error: null, hasRetried: false };

  resetState = () => this.setState({ error: null, hasRetried: true });

  componentDidCatch(error) {
    if (this.state.hasRetried) {
      // Already retried, still failing. Log it and set the state so we can show the persistent error.
      console.error('Fatal error encountered after retry:', error);
      this.setState({ error, hasRetried: true });
      return;
    }
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      if (isRelayNetworkError(this.state.error)) {
        return <NetworkError retry={this.resetState} />;
      }
      // If already retried once and failed again, show a persistent error state
      if (this.state.hasRetried) {
        return (
          <div className="page-not-found">
            <Icon img="icon_error_page_not_found" />
            <p>
              <FormattedMessage
                id="fatal-error"
                defaultMessage="A fatal error occurred. Please contact support."
              />
            </p>
          </div>
        );
      }
      return (
        <div className="page-not-found">
          <Icon img="icon_error_page_not_found" />
          <p>
            <FormattedMessage
              id="generic-error"
              defaultMessage="There was an error"
            />
          </p>
          <p>
            <button type="button" onClick={this.resetState}>
              <FormattedMessage id="try-again" defaultMessage="Try again ›" />
            </button>
          </p>
        </div>
      );
    }
    // when there's not an error, render children untouched
    return this.props.children || null;
  }
}