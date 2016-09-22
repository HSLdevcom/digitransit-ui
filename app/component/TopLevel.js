import React from 'react';
import Helmet from 'react-helmet';
import { intlShape } from 'react-intl';
import meta from '../meta';
import configureMoment from '../util/configure-moment';
import DefaultNavigation from './navigation/DefaultNavigation';

class TopLevel extends React.Component {
  static propTypes = {
    location: React.PropTypes.object.isRequired,
    children: React.PropTypes.node,
  }

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    intl: intlShape,
  };

  static childContextTypes = {
    location: React.PropTypes.object,
  };

  getChildContext() {
    return {
      location: this.props.location,
    };
  }

  render() {
    configureMoment(this.context.intl.locale);
    const metadata = meta(this.context.intl.locale);
    const topBarOptions = Object.assign({}, ...this.props.routes.map(route => route.topBarOptions));

    return (
      <DefaultNavigation className="fullscreen" title={this.props.title} {...topBarOptions}>
        <Helmet {...metadata} />
        {this.props.children || this.props.content}
      </DefaultNavigation>
    );
  }
}

export default TopLevel;
