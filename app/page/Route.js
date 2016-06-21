import React from 'react';
import Relay from 'react-relay';
import Helmet from 'react-helmet';
import DefaultNavigation from '../component/navigation/DefaultNavigation';
import Tabs from 'react-simpletabs';
import RouteListHeader from '../component/route/route-list-header';
import RouteHeaderContainer from '../component/route/RouteHeaderContainer';
import RouteStopListContainer from '../component/route/RouteStopListContainer';
import RouteMapContainer from '../component/route/route-map-container';
import RouteScheduleContainer from '../component/route/RouteScheduleContainer';
import RealTimeClient from '../action/real-time-client-action';
import intl, { FormattedMessage } from 'react-intl';
import NotFound from './404';

class RoutePage extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intl.intlShape.isRequired,
  };

  static propTypes = {
    pattern: React.PropTypes.node.isRequired,
  };

  componentDidMount() {
    const route = this.props.params.routeId.split(':');

    if (route[0].toLowerCase() === 'hsl') {
      this.context.executeAction(RealTimeClient.startRealTimeClient, {
        route: route[1],
        direction: route[2],
      });
    }
  }

  componentWillReceiveProps(newProps) {
    const route = newProps.params.routeId.split(':');
    const { client } = this.context.getStore('RealTimeInformationStore');

    if (client) {
      if (route[0].toLowerCase() === 'hsl') {
        this.context.executeAction(RealTimeClient.updateTopic, {
          client,
          oldTopics: this.context.getStore('RealTimeInformationStore').getSubscriptions(),

          newTopic: {
            route: route[1],
            direction: route[2],
          },
        });
      } else {
        this.componentWillUnmount();
      }
    } else if (route[0].toLowerCase() === 'hsl') {
      this.context.executeAction(RealTimeClient.startRealTimeClient, {
        route: route[1],
        direction: route[2],
      });
    }
  }

  componentWillUnmount() {
    const { client } = this.context.getStore('RealTimeInformationStore');

    if (client) {
      this.context.executeAction(RealTimeClient.stopRealTimeClient, client);
    }
  }

  render() {
    let title;
    if (this.props.pattern == null) {
      return <NotFound />;
    }
    const params = {
      route_short_name: this.props.pattern.route.shortName,
      route_long_name: this.props.pattern.route.longName,
    };

    title = this.context.intl.formatMessage({
      id: 'route-page.title',
      defaultMessage: 'Route {route_short_name}',
    }, params);

    const meta = {
      title,

      meta: [{
        name: 'description',

        content: this.context.intl.formatMessage({
          id: 'route-page.description',
          defaultMessage: 'Route {route_short_name} - {route_long_name}',
        }, params),
      }],
    };

    return (
      <DefaultNavigation className="fullscreen" title={title}>
        <Helmet {...meta} />
        <RouteHeaderContainer pattern={this.props.pattern} />
        <Tabs className="route-tabs">
          <Tabs.Panel
            title={<FormattedMessage id="stops" defaultMessage="Stops" />}
          >
            <RouteListHeader />
            <RouteStopListContainer pattern={this.props.pattern} />
          </Tabs.Panel>
          <Tabs.Panel
            title={<FormattedMessage id="map" defaultMessage="Map" />} className="fullscreen"
          >
            <RouteMapContainer pattern={this.props.pattern} className="fullscreen" />
          </Tabs.Panel>
          <Tabs.Panel
            title={<FormattedMessage id="timetable" defaultMessage="Timetable" />}
          >
            <RouteScheduleContainer pattern={this.props.pattern} />
          </Tabs.Panel>
        </Tabs>
      </DefaultNavigation>
    );
  }
}

RoutePage.propTypes = {
  params: React.PropTypes.object.isRequired,
};

export default Relay.createContainer(RoutePage, {
  fragments: {
    pattern: () => Relay.QL`
      fragment on Pattern {
        route {
          shortName
          longName
        }
        ${RouteHeaderContainer.getFragment('pattern')}
        ${RouteMapContainer.getFragment('pattern')}
        ${RouteScheduleContainer.getFragment('pattern')}
        ${RouteStopListContainer.getFragment('pattern')}
      }
    `,
  },
});
