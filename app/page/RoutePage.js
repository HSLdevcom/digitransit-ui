import React from 'react';
import Relay from 'react-relay';
import Helmet from 'react-helmet';
import DefaultNavigation from '../component/navigation/DefaultNavigation';
import Tabs from 'react-simpletabs';
import RouteListHeader from '../component/route/route-list-header';
import Icon from '../component/icon/icon';
import RouteHeaderContainer from '../component/route/RouteHeaderContainer';
import RouteStopListContainer from '../component/route/RouteStopListContainer';
import RouteMapContainer from '../component/route/RouteMapContainer';
import RouteScheduleContainer from '../component/route/RouteScheduleContainer';
import RouteAlertsContainer from '../component/route/RouteAlertsContainer';
import RoutePatternSelect from '../component/route/RoutePatternSelect';
import RealTimeClient from '../action/real-time-client-action';
import intl, { FormattedMessage } from 'react-intl';
import NotFound from './404';

class RoutePage extends React.Component {

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intl.intlShape.isRequired,
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    pattern: React.PropTypes.node.isRequired,
  };

  constructor() {
    super();
    this.selectRoutePattern.bind(this);
    this.toggleFullscreenMap.bind(this);
  }

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

  selectRoutePattern = (e) => {
    this.context.router.push({
      pathname: `/linjat/${e.target.value}`,
    });
  }

  isMapFullscreen = () => {
    if (typeof window !== 'undefined') {
      const state = this.context.location.state;
      return state && state.fullscreenMap;
    }
    return false;
  };

  toggleFullscreenMap = () => {
    if (this.context.location.state && this.context.location.state.fullscreenMap) {
      this.context.router.goBack();
    }
    this.context.router.push({
      state: {
        fullscreenMap: true,
      },
      pathname: this.context.location.pathname,
    });
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

    if (this.isMapFullscreen()) {
      return (
        <DefaultNavigation className="fullscreen" title={title}>
          <Helmet {...meta} />
          <RouteMapContainer
            pattern={this.props.pattern}
            toggleFullscreenMap={this.toggleFullscreenMap}
            className="fullscreen"
          />
        </DefaultNavigation>);
    }

    return (
      <DefaultNavigation className="fullscreen" title={title}>
        <Helmet {...meta} />
        <RouteHeaderContainer pattern={this.props.pattern} />
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
              pattern={this.props.pattern}
              onSelectChange={this.selectRoutePattern}
            />
            <RouteMapContainer
              pattern={this.props.pattern}
              toggleFullscreenMap={this.toggleFullscreenMap}
              className="routeMap"
            >
              <div className="map-click-prevent-overlay" onClick={this.toggleFullscreenMap} />
            </RouteMapContainer>
            <RouteListHeader />
            <RouteStopListContainer pattern={this.props.pattern} />
          </Tabs.Panel>
          <Tabs.Panel
            title={
              <div>
                <Icon img="icon-icon_schedule" />
                <FormattedMessage id="timetable" defaultMessage="Timetable" />
              </div>}
          >
            <RoutePatternSelect
              pattern={this.props.pattern}
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
};

export default Relay.createContainer(RoutePage, {
  fragments: {
    pattern: () => Relay.QL`
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
        ${RouteStopListContainer.getFragment('pattern')}
      }
    `,
  },
});
