import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import some from 'lodash/some';
import connectToStores from 'fluxible-addons-react/connectToStores';
import {
  getHomeUrl,
  parseLocation,
  PREFIX_STOPS,
  PREFIX_ROUTES,
  PREFIX_TERMINALS,
} from '../util/path';
import { dtLocationShape } from '../util/shapes';
import AppBarContainer from './AppBarContainer';
import MobileView from './MobileView';
import DesktopView from './DesktopView';
import ErrorBoundary from './ErrorBoundary';
import { DesktopOrMobile } from '../util/withBreakpoint';
import { getUser } from '../util/apiUtils';
import setUser from '../action/userActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class TopLevel extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.node,
    header: PropTypes.node,
    map: PropTypes.node,
    content: PropTypes.node,
    title: PropTypes.node,
    meta: PropTypes.node,
    routes: PropTypes.arrayOf(
      PropTypes.shape({
        topBarOptions: PropTypes.object,
        disableMapOnMobile: PropTypes.bool,
      }).isRequired,
    ).isRequired,
    params: PropTypes.shape({
      from: PropTypes.string,
      to: PropTypes.string,
      routeId: PropTypes.string,
      stopId: PropTypes.string,
      terminalId: PropTypes.string,
    }).isRequired,
    origin: dtLocationShape,
    user: PropTypes.object,
  };

  static contextTypes = {
    headers: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    executeAction: PropTypes.func.isRequired,
  };

  static defaultProps = {
    origin: {
      set: false,
      ready: false,
    },
  };

  static childContextTypes = {
    location: PropTypes.object,
  };

  getChildContext() {
    return {
      location: this.props.location,
    };
  }

  componentDidMount() {
    import(/* webpackChunkName: "main" */ `../configurations/images/${
      this.context.config.logo
    }`).then(logo => {
      this.setState({ logo: logo.default });
    });
    if (this.context.config.showLogin && !this.props.user.name) {
      getUser()
        .then(user => {
          this.context.executeAction(setUser, {
            ...user,
          });
        })
        .catch(() => {
          this.context.executeAction(setUser, {});
        });
    }
  }

  componentDidUpdate(prevProps) {
    // send tracking calls when url changes
    // listen for this here instead of in router directly to get access to old location as well
    const oldLocation = prevProps.location.pathname;
    const newLocation = this.props.location.pathname;
    if (oldLocation && newLocation && oldLocation !== newLocation) {
      addAnalyticsEvent({
        event: 'Pageview',
        url: newLocation,
      });
    }

    // send tracking calls when visiting a new stop or route
    const newContext = newLocation.slice(1, newLocation.indexOf('/', 1));
    switch (newContext) {
      case PREFIX_ROUTES:
        if (
          oldLocation.indexOf(newContext) !== 1 ||
          (prevProps.params.routeId &&
            this.props.params.routeId &&
            prevProps.params.routeId !== this.props.params.routeId)
        ) {
          addAnalyticsEvent({
            category: 'Route',
            action: 'OpenRoute',
            name: this.props.params.routeId,
          });
        }
        break;
      case PREFIX_STOPS:
      case PREFIX_TERMINALS:
        if (
          oldLocation.indexOf(newContext) !== 1 ||
          (prevProps.params.stopId &&
            this.props.params.stopId &&
            prevProps.params.stopId !== this.props.params.stopId) ||
          (prevProps.params.terminalId &&
            this.props.params.terminalId &&
            prevProps.params.terminalId !== this.props.params.terminalId)
        ) {
          addAnalyticsEvent({
            category: 'Stop',
            action: 'OpenStop',
            name: this.props.params.stopId || this.props.params.terminalId,
          });
        }
        break;
      default:
        break;
    }
  }

  render() {
    this.topBarOptions = Object.assign(
      {},
      ...this.props.routes.map(route => route.topBarOptions),
    );
    this.disableMapOnMobile = some(
      this.props.routes,
      route => route.disableMapOnMobile,
    );

    let content;

    const homeUrl = getHomeUrl(
      this.props.origin,
      parseLocation(this.props.params.to),
    );

    if (this.props.children || !(this.props.map || this.props.header)) {
      content = this.props.children || this.props.content;
    } else {
      content = (
        <DesktopOrMobile
          mobile={() => (
            <MobileView
              map={this.disableMapOnMobile || this.props.map}
              content={this.props.content}
              header={this.props.header}
            />
          )}
          desktop={() => (
            <DesktopView
              title={this.props.title}
              map={this.props.map}
              content={this.props.content}
              header={this.props.header}
              homeUrl={homeUrl}
            />
          )}
        />
      );
    }

    return (
      <Fragment>
        {!this.topBarOptions.hidden && (
          <AppBarContainer
            title={this.props.title}
            {...this.topBarOptions}
            {...this.state}
            homeUrl={homeUrl}
          />
        )}
        <section id="mainContent" className="content">
          {this.props.meta}
          <noscript>This page requires JavaScript to run.</noscript>
          <ErrorBoundary>{content}</ErrorBoundary>
        </section>
      </Fragment>
    );
  }
}

export default connectToStores(
  TopLevel,
  ['OriginStore', 'UserStore'],
  ({ getStore }) => ({
    origin: getStore('OriginStore').getOrigin(),
    user: getStore('UserStore').getUser(),
  }),
);
