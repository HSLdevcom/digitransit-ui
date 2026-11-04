import PropTypes from 'prop-types';
import { Component } from 'react';

import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import NetworkError from './NetworkError';
import isRelayNetworkError from '../../utils/client/relayUtils';

export default class ErrorBoundary extends Component {
  static propTypes = {
    children: PropTypes.node,
    // Rendered instead of the error page. With a fallback the boundary never
    // retries or reloads the window, so use it for non-essential content.
    // Pass an empty fragment to render nothing; a null fallback is ignored.
    fallback: PropTypes.node,
  };

  state = { error: null, hasRetried: false };

  static getDerivedStateFromError(error) {
    return { error };
  }

  resetState = () => this.setState({ error: null, hasRetried: true });

  componentDidCatch() {
    if (!this.props.fallback && this.state.hasRetried) {
      // Did retry, didn't help
      window.location.reload();
    }
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      if (isRelayNetworkError(this.state.error)) {
        return <NetworkError retry={this.resetState} />;
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
