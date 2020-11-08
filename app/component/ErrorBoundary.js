import PropTypes from 'prop-types';
import React from 'react';

import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

export default class ErrorBoundary extends React.Component {
  static propTypes = { children: PropTypes.node.isRequired };

  static contextTypes = {
    sentry: PropTypes.shape({
      captureException: PropTypes.func.isRequired,
    }),
  };

  state = { error: null, hasRetried: false };

  resetState = () => this.setState({ error: null, hasRetried: true });

  componentDidCatch(error, errorInfo) {
    if (this.state.hasRetried) {
      // Did retry, didn't help
      window.location.reload();
      return;
    }
    this.setState({ error });
    if (this.context.sentry) {
      this.context.sentry.withScope(scope => {
        scope.setExtra(errorInfo);
        this.context.sentry.captureException(error);
      });
    }
  }

  render() {
    if (this.state.error) {
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
              <button onClick(() => this.context.sentry.getCurrentHub().lastEventId() && this.context.sentry.showReportDialog())>
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
