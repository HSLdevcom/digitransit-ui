import PropTypes from 'prop-types';
import React from 'react';

import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import NetworkError from './NetworkError';

export default class ErrorBoundary extends React.Component {
  static propTypes = { children: PropTypes.node.isRequired };

  static contextTypes = {
    raven: PropTypes.shape({
      captureException: PropTypes.func.isRequired,
    }),
  };

  state = { error: null, hasRetried: false };

  isRelayNetworkError = error =>
    typeof error === 'string' &&
    (error ===
      'Server does not return response for request at index 0.\nResponse should have an array with 1 item(s).' ||
      error.includes('Reached request timeout'));

  resetState = () => this.setState({ error: null, hasRetried: true });

  componentDidCatch(error, errorInfo) {
    if (this.state.hasRetried) {
      // Did retry, didn't help
      window.location.reload();
      return;
    }
    this.setState({ error });
    if (this.context.raven && !this.isRelayNetworkError(error)) {
      this.context.raven.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.error) {
      if (this.isRelayNetworkError(this.state.error)) {
        return <NetworkError retry={this.resetState} />;
      }
      return (
        <div className="page-not-found">
          <Icon img="icon-icon_error_page_not_found" />
          <p>
            <FormattedMessage
              id="generic-error"
              defaultMessage="There was an error"
            />
          </p>
          <p>
            <button onClick={this.resetState}>
              <FormattedMessage id="try-again" defaultMessage="Try again ›" />
            </button>
            {/*
              <button onClick(() => this.context.raven.lastEventId() && this.context.raven.showReportDialog())>
                <FormattedMessage id="tell-us-what-happened" defaultMessage="Tell us what happened" />
              </button>
              */}
          </p>
        </div>
      );
    }
    // when there's not an error, render children untouched
    return this.props.children || null;
  }
}
