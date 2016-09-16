import React from 'react';
import Relay from 'react-relay';
import Helmet from 'react-helmet';
import { FormattedMessage, intlShape } from 'react-intl';
import Link from 'react-router/lib/Link';

import DefaultNavigation from '../component/navigation/DefaultNavigation';
import Icon from '../component/icon/icon';
import FavouriteRouteContainer from '../component/favourites/FavouriteRouteContainer';
import RouteNumber from '../component/departure/RouteNumber';
import { startRealTimeClient, stopRealTimeClient } from '../action/realTimeClientAction';
import NotFound from './404';

class RoutePage extends React.Component {

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    route: React.PropTypes.object.isRequired,
    children: React.PropTypes.node.isRequired,
  };

  componentDidMount() {
    if (this.props.route == null) { return; }
    const route = this.props.route.gtfsId.split(':');

    if (route[0].toLowerCase() === 'hsl') {
      this.context.executeAction(startRealTimeClient, {
        route: route[1],
      });
    }
  }

  componentWillUnmount() {
    const { client } = this.context.getStore('RealTimeInformationStore');

    if (client) {
      this.context.executeAction(stopRealTimeClient, client);
    }
  }

  render() {
    if (this.props.route == null) {
      return <div className="error"><NotFound /></div>; // TODO: redirect?
    }

    const params = {
      route_short_name: this.props.route.shortName,
      route_long_name: this.props.route.longName,
    };

    const meta = {
      title: this.context.intl.formatMessage({
        id: 'route-page.title',
        defaultMessage: 'Route {route_short_name}',
      }, params),
      meta: [{
        name: 'description',
        content: this.context.intl.formatMessage({
          id: 'route-page.description',
          defaultMessage: 'Route {route_short_name} - {route_long_name}',
        }, params),
      }],
    };

    return (
      <DefaultNavigation
        className="fullscreen"
        title={
          <Link to={`/linjat/${this.props.route.gtfsId}`}>
            <RouteNumber
              mode={this.props.route.mode}
              text={this.props.route.shortName}
            />
          </Link>
        }
      >
        <Helmet {...meta} />
        <FavouriteRouteContainer
          className="route-page-header"
          gtfsId={this.props.route.gtfsId}
        />
        <div className="tabs route-tabs">
          <nav className="tabs-navigation">
            <Link to={`/linjat/${this.props.route.gtfsId}/pysakit`} activeClassName="is-active">
              <div>
                <Icon img="icon-icon_bus-stop" />
                <FormattedMessage id="stops" defaultMessage="Stops" />
              </div>
            </Link>
            <Link to={`/linjat/${this.props.route.gtfsId}/aikataulu`} activeClassName="is-active">
              <div>
                <Icon img="icon-icon_schedule" />
                <FormattedMessage id="timetable" defaultMessage="Timetable" />
              </div>
            </Link>
            <Link to={`/linjat/${this.props.route.gtfsId}/hairiot`} activeClassName="is-active">
              <div>
                <Icon img="icon-icon_caution" />
                <FormattedMessage id="disruptions" defaultMessage="Disruptions" />
              </div>
            </Link>
          </nav>
          <article className="tab-panel">
            {this.props.children}
          </article>
        </div>
      </DefaultNavigation>
    );
  }
}

export default Relay.createContainer(RoutePage, {
  fragments: {
    route: () =>
      Relay.QL`
      fragment on Route {
        gtfsId
        shortName
        longName
        mode
      }
    `,
  },
});
