import React from 'react';
import Relay from 'react-relay';
import Helmet from 'react-helmet';
import Tabs from 'react-simpletabs';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { FormattedMessage, intlShape } from 'react-intl';

import DefaultNavigation from '../component/navigation/DefaultNavigation';
import RouteListHeader from '../component/route/RouteListHeader';
import Icon from '../component/icon/icon';
import RouteHeaderContainer from '../component/route/RouteHeaderContainer';
import RouteStopListContainer from '../component/route/RouteStopListContainer';
import RouteMapContainer from '../component/route/RouteMapContainer';
import RouteScheduleContainer from '../component/route/RouteScheduleContainer';
import RouteAlertsContainer from '../component/route/RouteAlertsContainer';
import RoutePatternSelect from '../component/route/RoutePatternSelect';
import TripListHeader from '../component/trip/TripListHeader';
import TripStopListContainer from '../component/trip/TripStopListContainer';
import { startRealTimeClient, updateTopic, stopRealTimeClient }
  from '../action/realTimeClientAction';
import NotFound from './404';

class RoutePage extends React.Component {

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    pattern: React.PropTypes.object.isRequired,
    fullscreenMap: React.PropTypes.bool,
    tripStart: React.PropTypes.string,
  };

  componentDidMount() {
    const route = this.props.pattern.code.split(':');

    if (route[0].toLowerCase() === 'hsl') {
      this.context.executeAction(startRealTimeClient, {
        route: route[1],
        direction: route[2],
      });
    }
  }

  componentWillReceiveProps(newProps) {
    const route = newProps.pattern.code.split(':');
    const { client } = this.context.getStore('RealTimeInformationStore');

    if (client) {
      if (route[0].toLowerCase() === 'hsl') {
        this.context.executeAction(updateTopic, {
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
      this.context.executeAction(startRealTimeClient, {
        route: route[1],
        direction: route[2],
      });
    }
  }

  componentWillUnmount() {
    const { client } = this.context.getStore('RealTimeInformationStore');

    if (client) {
      this.context.executeAction(stopRealTimeClient, client);
    }
  }

  selectRoutePattern = (e) => {
    this.context.router.push({
      pathname: `/linjat/${e.target.value}`,
    });
  }

  toggleFullscreenMap = () => {
    if (this.props.fullscreenMap) {
      this.context.router.goBack();
      return;
    }
    this.context.router.push(`${this.context.location.pathname}/kartta`);
  };

  render() {
    if (this.props.pattern == null) {
      return <NotFound />;
    }

    const params = {
      route_short_name: this.props.pattern.route.shortName,
      route_long_name: this.props.pattern.route.longName,
    };

    const title = this.context.intl.formatMessage({
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

    let mainContent = null;

    if (!this.props.fullscreenMap) {
      mainContent = this.props.trip ? ([
        <TripListHeader key="header" />,
        <TripStopListContainer
          key="list" tripStart={this.props.tripStart} trip={this.props.trip}
        />,
      ]) : ([
        <RouteListHeader key="header" />,
        <RouteStopListContainer
          key="list"
          pattern={this.props.pattern}
          routeId={this.props.pattern.code}
        />,
      ]);
    }


    return (
      <DefaultNavigation className="fullscreen" title={title}>
        <Helmet {...meta} />
        <RouteHeaderContainer pattern={this.props.pattern} />
        <Tabs className="route-tabs">
          <ReactCSSTransitionGroup
            component={Tabs.Panel}
            transitionName="route-page-content"
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}
            title={
              <div>
                <Icon img="icon-icon_bus-stop" />
                <FormattedMessage id="stops" defaultMessage="Stops" />
              </div>
            }
          >
            <RoutePatternSelect
              key="patternSelect"
              pattern={this.props.pattern}
              onSelectChange={this.selectRoutePattern}
            />
            <RouteMapContainer
              key="map"
              tripStart={this.props.tripStart}
              pattern={this.props.pattern}
              toggleFullscreenMap={this.toggleFullscreenMap}
              className="routeMap full"
            >
              {!this.props.fullscreenMap ?
                <div className="map-click-prevent-overlay" onClick={this.toggleFullscreenMap} /> :
                null
              }
            </RouteMapContainer>
            {mainContent}
          </ReactCSSTransitionGroup>
          <Tabs.Panel
            title={
              <div>
                <Icon img="icon-icon_schedule" />
                <FormattedMessage id="timetable" defaultMessage="Timetable" />
              </div>}
          >
            <RoutePatternSelect
              pattern={this.props.pattern}
              onSelectChange={this.selectRoutePattern}
            />
            <RouteScheduleContainer pattern={this.props.pattern} />
          </Tabs.Panel>
          <Tabs.Panel
            title={
              <div>
                <Icon img="icon-icon_caution" />
                <FormattedMessage id="disruptions" defaultMessage="Disruptions" />
              </div>}
          >
            <RouteAlertsContainer route={this.props.pattern.route} />
          </Tabs.Panel>
        </Tabs>
      </DefaultNavigation>
    );
  }
}

RoutePage.propTypes = {
  params: React.PropTypes.object.isRequired,
  relay: React.PropTypes.object.isRequired,
  trip: React.PropTypes.object,
};

export default Relay.createContainer(RoutePage, {
  initialVariables: {
    routeId: null,
  },

  fragments: {
    pattern: ({ routeId }) =>
      Relay.QL`
      fragment on Pattern {
        code
        headsign
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
          ${RouteAlertsContainer.getFragment('route')}
        }
        ${RouteHeaderContainer.getFragment('pattern')}
        ${RouteMapContainer.getFragment('pattern')}
        ${RouteScheduleContainer.getFragment('pattern')}
        ${RouteStopListContainer.getFragment('pattern', { routeId })}
      }
    `,
  },
});
