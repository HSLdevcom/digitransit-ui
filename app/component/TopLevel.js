import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import some from 'lodash/some';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { matchShape, routerShape } from 'found';
import { getHomeUrl, parseLocation } from '../util/path';
import { dtLocationShape } from '../util/shapes';
import AppBarContainer from './AppBarContainer';
import MobileView from './MobileView';
import DesktopView from './DesktopView';
import ErrorBoundary from './ErrorBoundary';
import { DesktopOrMobile } from '../util/withBreakpoint';
import getJson from '../util/apiUtils';
import setUser from '../action/userActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class TopLevel extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    header: PropTypes.node,
    map: PropTypes.node,
    content: PropTypes.node,
    title: PropTypes.node,
    meta: PropTypes.node,
    match: matchShape.isRequired,
    origin: dtLocationShape,
    user: PropTypes.object,
    router: routerShape,
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
    router: routerShape,
    match: matchShape,
  };

  getChildContext() {
    return {
      match: this.props.match,
      router: this.props.router,
    };
  }

  componentDidMount() {
    import(/* webpackChunkName: "main" */ `../configurations/images/${
      this.context.config.logo
    }`).then(logo => {
      this.setState({ logo: logo.default });
    });
    if (this.context.config.showLogin && !this.props.user.name) {
      getJson(`/api/user`)
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
    const oldLocation = prevProps.match.location.pathname;
    const newLocation = this.props.match.location.pathname;
    if (oldLocation && newLocation && oldLocation !== newLocation) {
      addAnalyticsEvent({
        event: 'Pageview',
        url: newLocation,
      });
    }

    // send tracking calls when visiting a new stop or route
    const newContext = newLocation.slice(1, newLocation.indexOf('/', 1));
    switch (newContext) {
      case 'linjat':
        if (
          oldLocation.indexOf(newContext) !== 1 ||
          (prevProps.match.params.routeId &&
            this.props.match.params.routeId &&
            prevProps.match.params.routeId !== this.props.match.params.routeId)
        ) {
          addAnalyticsEvent({
            category: 'Route',
            action: 'OpenRoute',
            name: this.props.match.params.routeId,
          });
        }
        break;
      case 'pysakit':
      case 'terminaalit':
        if (
          oldLocation.indexOf(newContext) !== 1 ||
          (prevProps.match.params.stopId &&
            this.props.match.params.stopId &&
            prevProps.match.params.stopId !== this.props.match.params.stopId) ||
          (prevProps.match.params.terminalId &&
            this.props.match.params.terminalId &&
            prevProps.match.params.terminalId !==
              this.props.match.params.terminalId)
        ) {
          addAnalyticsEvent({
            category: 'Stop',
            action: 'OpenStop',
            name:
              this.props.match.params.stopId ||
              this.props.match.params.terminalId,
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
      ...this.props.match.routes.map(route => route.topBarOptions),
    );
    this.disableMapOnMobile = some(
      this.props.match.routes,
      route => route.disableMapOnMobile,
    );

    let content;

    const homeUrl = getHomeUrl(
      this.props.origin,
      parseLocation(this.props.match.params.to),
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
