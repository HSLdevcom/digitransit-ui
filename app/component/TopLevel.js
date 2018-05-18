import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { intlShape } from 'react-intl';
import some from 'lodash/some';
import get from 'lodash/get';
import throttle from 'lodash/throttle';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { getHomeUrl, parseLocation } from '../util/path';
import { dtLocationShape } from '../util/shapes';
import meta from '../meta';
import AppBarContainer from './AppBarContainer';
import MobileView from './MobileView';
import DesktopView from './DesktopView';
import HSLAdformTrackingPixel from './HSLAdformTrackingPixel';
import ErrorBoundary from './ErrorBoundary';

import { isBrowser } from '../util/browser';

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
    getStore: PropTypes.func.isRequired,
    intl: intlShape,
    url: PropTypes.string.isRequired,
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
    breakpoint: PropTypes.string.isRequired,
  };

  constructor(props, { url, headers, config, intl }) {
    super(props);
    const host = headers && (headers['x-forwarded-host'] || headers.host);

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

    this.metadata = meta(intl.locale, host, url, config);
    this.state = { breakpoint: this.getBreakpoint() };
  }

  getChildContext() {
    return {
      location: this.props.location,
      breakpoint: this.state.breakpoint,
    };
  }

  componentDidMount() {
    this.updateBreakpoint = throttle(
      () =>
        this.setState(
          ({ breakpoint }) =>
            this.getBreakpoint() !== breakpoint
              ? { breakpoint: this.getBreakpoint() }
              : null,
        ),
      100,
    );
    window.addEventListener('resize', this.updateBreakpoint);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateBreakpoint);
  }

  getBreakpoint() {
    if (isBrowser) {
      if (window.innerWidth < 400) {
        return 'small';
      } else if (window.innerWidth < 900) {
        return 'medium';
      }
    } else if (
      'user-agent' in this.context.headers &&
      this.context.headers['user-agent'].toLowerCase().includes('mobile')
    ) {
      return 'small';
    }
    return 'large';
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
    } else if (this.state.breakpoint !== 'large') {
      content = (
        <MobileView
          map={this.disableMapOnMobile || this.props.map}
          content={this.props.content}
          header={this.props.header}
        />
      );
    } else {
      content = (
        <DesktopView
          title={this.props.title}
          map={this.props.map}
          content={this.props.content}
          header={this.props.header}
          homeUrl={homeUrl}
        />
      );
    }

    return (
      <Fragment>
        {!this.topBarOptions.hidden && (
          <AppBarContainer
            title={this.props.title}
            {...this.topBarOptions}
            homeUrl={homeUrl}
          />
        )}
        <Helmet {...this.metadata} />
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
