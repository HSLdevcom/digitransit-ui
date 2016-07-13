import React from 'react';
import Relay from 'react-relay';
import Helmet from 'react-helmet';
import Tabs from 'react-simpletabs';
import DefaultNavigation from '../component/navigation/DefaultNavigation';
import RouteHeaderContainer from '../component/route/RouteHeaderContainer';
import TripListHeader from '../component/trip/TripListHeader';
import TripStopListContainer from '../component/trip/TripStopListContainer';
import RouteMapContainer from '../component/route/RouteMapContainer';
import RouteScheduleContainer from '../component/route/RouteScheduleContainer';
import RealTimeClient from '../action/real-time-client-action';
import RoutePatternSelect from '../component/route/RoutePatternSelect';
import timeUtils from '../util/time-utils';
import intl, { FormattedMessage } from 'react-intl';
import Icon from '../component/icon/icon';

class TripPage extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intl.intlShape.isRequired,
  };

  static propTypes = {
    trip: React.PropTypes.object.isRequired,
  }

  componentDidMount() {
    const route = this.props.trip.pattern.code.split(':');

    if (route[0].toLowerCase() === 'hsl') {
      this.context.executeAction(RealTimeClient.startRealTimeClient, {
        route: route[1],
        direction: route[2],
      });
    }
  }

  componentWillReceiveProps(newProps) {
    let tripStartTime;
    const route = newProps.trip.pattern.code.split(':');
    const { client } = this.context.getStore('RealTimeInformationStore');

    if (client) {
      if (route[0].toLowerCase() === 'hsl') {
        tripStartTime = timeUtils.getStartTime(newProps.trip.stoptimes[0].scheduledDeparture);

        this.context.executeAction(RealTimeClient.updateTopic, {
          client,
          oldTopics: this.context.getStore('RealTimeInformationStore').getSubscriptions(),

          newTopic: {
            route: route[1],
            direction: route[2],
            tripStartTime,
          },
        });
      } else {
        this.componentWillUnmount();
      }
    } else if (route[0].toLowerCase() === 'hsl') {
      tripStartTime = timeUtils.getStartTime(newProps.trip.stoptimes[0].scheduledDeparture);

      this.context.executeAction(RealTimeClient.startRealTimeClient, {
        route: route[1],
        direction: route[2],
        tripStartTime,
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
    const tripStartTime = timeUtils.getStartTime(this.props.trip.stoptimes[0].scheduledDeparture);

    const params = {
      route_short_name: this.props.trip.pattern.route.shortName,
      route_long_name: this.props.trip.pattern.route.longName,
    };

    const title = this.context.intl.formatMessage({
      id: 'trip-page.title',
      defaultMessage: 'Route {route_short_name}',
    }, params);

    const meta = {
      title,
      meta: [{
        name: 'description',
        content: this.context.intl.formatMessage({
          id: 'trip-page.description',
          defaultMessage: 'Route {route_short_name} - {route_long_name}',
        }, params),
      }],
    };

    return (
      <DefaultNavigation className="fullscreen trip" title={title}>
        <Helmet {...meta} />
        <RouteHeaderContainer
          className="trip-header"
          pattern={this.props.trip.pattern}
          trip={tripStartTime}
        />
        <Tabs className="route-tabs">
          <Tabs.Panel
            title={
              <div>
                <Icon img="icon-icon_bus-stop" />
                <FormattedMessage id="stops" defaultMessage="Stops" />
              </div>
            }
          >
            <RoutePatternSelect
              pattern={this.props.trip.pattern}
              onSelectChange={this.selectRoutePattern}
            />
            <TripListHeader />
            <TripStopListContainer className="below-map" trip={this.props.trip} />
          </Tabs.Panel>
          <Tabs.Panel
            title={
              <div>
                <Icon img="icon-icon_schedule" />
                <FormattedMessage id="timetable" defaultMessage="Timetable" />
              </div>}
          >
            <RoutePatternSelect
              pattern={this.props.trip.pattern}
            />
            <RouteScheduleContainer pattern={this.props.trip.pattern} />
          </Tabs.Panel>
          <Tabs.Panel
            title={
              <div>
                <Icon img="icon-icon_caution" />
                <FormattedMessage id="disruptions" defaultMessage="Disruptions" />
              </div>}
          >
            TODO
          </Tabs.Panel>
        </Tabs>
      </DefaultNavigation>);
  }
}

export default Relay.createContainer(TripPage, {
  fragments: {
    trip: () => Relay.QL`
      fragment on Trip {
        pattern {
          code
          route {
            shortName
            longName
            patterns {
              code
              headsign
              stops {
                name
              }
            }
          }
          ${RouteHeaderContainer.getFragment('pattern')}
          ${RouteMapContainer.getFragment('pattern')}
        }
        stoptimes {
          scheduledDeparture
        }
        gtfsId
        ${TripStopListContainer.getFragment('trip')}
      }
    `,
  },
});
