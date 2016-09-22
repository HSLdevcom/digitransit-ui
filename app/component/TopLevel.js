import React from 'react';
import Helmet from 'react-helmet';
import { intlShape } from 'react-intl';
import meta from '../meta';
import configureMoment from '../util/configure-moment';

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

    return (
      <div className="fullscreen">
        <Helmet {...metadata} />
        {this.props.children}
      </div>
    );
  }
}

export default TopLevel;
