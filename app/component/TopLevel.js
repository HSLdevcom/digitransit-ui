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
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
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
      breakpoint:
        (this.props.width < 400 && 'small') || (this.props.width < 900 && 'medium') || 'large',
    };
  }

  render() {
    configureMoment(this.context.intl.locale);
    const metadata = meta(this.context.intl.locale);
    const topBarOptions = Object.assign({}, ...this.props.routes.map(route => route.topBarOptions));

    let content;

    if (this.props.children || !(this.props.map || this.props.header)) {
      content = this.props.children || this.props.content;
    } else if (this.props.width < 900) {
      content = (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {this.props.header}
          {this.props.map}
          {this.props.content}
        </div>
      );
    } else {
      content = (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: '100%',
          }}
        >
         <div style={{
           width: 600,
           height: '100%',
           display: 'flex',
           flexDirection: 'column',
         }}>
            {this.props.header}
            {this.props.content}
          </div>
          <div
            style={{
              width: 'calc(100% - 600px)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {this.props.map}
          </div>
        </div>
      );
    }

    return (
      <DefaultNavigation className="fullscreen" title={this.props.title} {...topBarOptions}>
        <Helmet {...metadata} />
        { content }
      </DefaultNavigation>
    );
  }
}

export default TopLevel;
