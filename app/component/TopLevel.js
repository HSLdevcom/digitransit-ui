import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import some from 'lodash/some';
import get from 'lodash/get';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { getHomeUrl, parseLocation } from '../util/path';
import { dtLocationShape } from '../util/shapes';
import AppBarContainer from './AppBarContainer';
import MobileView from './MobileView';
import DesktopView from './DesktopView';
import HSLAdformTrackingPixel from './HSLAdformTrackingPixel';
import ErrorBoundary from './ErrorBoundary';
import { DesktopOrMobile } from '../util/withBreakpoint';

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
    }).isRequired,
    origin: dtLocationShape,
  };

  static contextTypes = {
    headers: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
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

  constructor(props, { headers, config }) {
    super(props);
    const host = headers && (headers['x-forwarded-host'] || headers.host);

    // TODO: Move this to server.js
    const hasTrackingPixel = get(config, 'showHSLTracking', false);
    this.trackingPixel =
      host &&
      host.indexOf('127.0.0.1') === -1 &&
      host.indexOf('localhost') === -1 &&
      hasTrackingPixel ? (
        <HSLAdformTrackingPixel key="trackingpixel" />
      ) : (
        undefined
      );
  }

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
        {this.trackingPixel}
      </Fragment>
    );
  }
}

export default connectToStores(TopLevel, ['OriginStore'], ({ getStore }) => ({
  origin: getStore('OriginStore').getOrigin(),
}));
