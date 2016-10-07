import React from 'react';
import Helmet from 'react-helmet';
import { intlShape } from 'react-intl';
import meta from '../meta';
import configureMoment from '../util/configure-moment';
import MobileView from './MobileView';
import DesktopView from './DesktopView';
import { default as DefaultNavigation } from './navigation/DefaultNavigation';

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
      }).isRequired
    ).isRequired,
  }

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    intl: intlShape,
  };

  static childContextTypes = {
    location: React.PropTypes.object,
    breakpoint: React.PropTypes.string.isRequired,
  };

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
    configureMoment(this.context.intl.locale);
    const metadata = meta(this.context.intl.locale);
    const topBarOptions = Object.assign({}, ...this.props.routes.map(route => route.topBarOptions));

    let content;

    if (this.props.children || !(this.props.map || this.props.header)) {
      content = this.props.children || this.props.content;
    } else if (this.props.width < 900) {
      content = (
        <MobileView
          map={this.props.map}
          content={this.props.content}
          header={this.props.header}
        />
     );
    } else if (this.props.width >= 900) {
      content = (
        <DesktopView
          map={this.props.map}
          content={this.props.content}
          header={this.props.header}
        />
      );
    }

    return (
      <DefaultNavigation
        className={`fullscreen breakpoint-${this.getBreakpoint()}`}
        title={this.props.title}
        {...topBarOptions}
      >
        <Helmet {...metadata} />
        {this.props.meta}
        { content }
      </DefaultNavigation>
    );
  }
}

export default TopLevel;
