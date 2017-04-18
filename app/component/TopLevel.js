import React from 'react';
import Helmet from 'react-helmet';
import { intlShape } from 'react-intl';
import some from 'lodash/some';
import get from 'lodash/get';

import meta from '../meta';
import configureMoment from '../util/configure-moment';
import AppBarContainer from './AppBarContainer';
import MobileView from './MobileView';
import DesktopView from './DesktopView';
import HSLAdformTrackingPixel from './HSLAdformTrackingPixel';

class TopLevel extends React.Component {
  static propTypes = {
    location: React.PropTypes.object.isRequired,
    children: React.PropTypes.node,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    header: React.PropTypes.node,
    map: React.PropTypes.node,
    content: React.PropTypes.node,
    title: React.PropTypes.node,
    meta: React.PropTypes.node,
    routes: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        topBarOptions: React.PropTypes.object,
        disableMapOnMobile: React.PropTypes.bool,
      }).isRequired,
    ).isRequired,
  }

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    intl: intlShape,
    url: React.PropTypes.string.isRequired,
    headers: React.PropTypes.object.isRequired,
    config: React.PropTypes.object.isRequired,
  };

  static childContextTypes = {
    location: React.PropTypes.object,
    breakpoint: React.PropTypes.string.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    configureMoment(context.intl.locale, context.config);
    const host = context.headers && (context.headers['x-forwarded-host'] || context.headers.host);
    const url = context.url;

    const hasTrackingPixel = get(context, 'config.showAdformTrackingPixel', false);
    this.trackingPixel = host && host.indexOf('127.0.0.1') === -1 && host.indexOf('localhost') === -1 && hasTrackingPixel ? <HSLAdformTrackingPixel /> : undefined;

    this.metadata = meta(this.context.intl.locale, host, url, this.context.config);
  }

  getChildContext() {
    return {
      location: this.props.location,
      breakpoint: this.getBreakpoint(),
    };
  }

  getBreakpoint = () =>
    (!this.props.width && 'none') ||
    (this.props.width < 400 && 'small') ||
    (this.props.width < 900 && 'medium') ||
    'large'

  render() {
    this.topBarOptions = Object.assign({}, ...this.props.routes.map(route => route.topBarOptions));
    this.disableMapOnMobile = some(this.props.routes, route => route.disableMapOnMobile);

    let content;

    if (this.props.children || !(this.props.map || this.props.header)) {
      content = this.props.children || this.props.content;
    } else if (this.props.width < 900) {
      content = (
        <MobileView
          map={this.disableMapOnMobile || this.props.map}
          content={this.props.content}
          header={this.props.header}
        />
     );
    } else if (this.props.width >= 900) {
      content = (
        <DesktopView
          title={this.props.title}
          map={this.props.map}
          content={this.props.content}
          header={this.props.header}
        />
      );
    }

    const menuHeight = (this.getBreakpoint() === 'large' && '60px') || '40px';

    return (
      <div className="fullscreen">
        {!this.topBarOptions.hidden &&
          <AppBarContainer title={this.props.title} {...this.topBarOptions} />}
        <Helmet {...this.metadata} />
        <section className="content" style={{ height: `calc(100% - ${menuHeight})` }}>
          {this.props.meta}
          { content }
        </section>
        {this.trackingPixel}
      </div>
    );
  }
}

export default TopLevel;
