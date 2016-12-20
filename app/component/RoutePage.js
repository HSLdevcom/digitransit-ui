import React from 'react';
import Relay from 'react-relay';
import { FormattedMessage, intlShape } from 'react-intl';
import { Link } from 'react-router';
import cx from 'classnames';

import Icon from './Icon';
import FavouriteRouteContainer from './FavouriteRouteContainer';
import RoutePatternSelect from './RoutePatternSelect';
import RouteAgencyInfo from './RouteAgencyInfo';
import RouteNumber from './RouteNumber';
import { startRealTimeClient, stopRealTimeClient } from '../action/realTimeClientAction';
import NotFound from './404';

class RoutePage extends React.Component {

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    router: React.PropTypes.shape({
      replace: React.PropTypes.func.isRequired,
    }).isRequired,
    intl: intlShape.isRequired,
    breakpoint: React.PropTypes.string,
  };

  static propTypes = {
    route: React.PropTypes.object.isRequired,
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string.isRequired,
    }).isRequired,
    params: React.PropTypes.shape({
      patternId: React.PropTypes.string.isRequired,
    }).isRequired,
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

  onPatternChange = (e) => {
    this.context.router.replace(
      decodeURIComponent(this.props.location.pathname)
        .replace(new RegExp(`${this.props.params.patternId}(.*)`), e.target.value),
    );
  }

  render() {
    if (this.props.route == null) {
      return <div className="error"><NotFound /></div>; // TODO: redirect?
    }

    return (
      <div className="tabs route-tabs">
        <nav className={cx('tabs-navigation', { 'bp-large': this.context.breakpoint === 'large' })}>
          { this.context.breakpoint === 'large' && (
            <RouteNumber mode={this.props.route.mode} text={this.props.route.shortName} />
          )}
          <Link
            to={`/linjat/${this.props.route.gtfsId}/pysakit/${this.props.params.patternId || ''}`}
            activeClassName="is-active"
          >
            <div>
              <Icon img="icon-icon_bus-stop" />
              <FormattedMessage id="stops" defaultMessage="Stops" />
            </div>
          </Link>
          <Link
            to={`/linjat/${this.props.route.gtfsId}/aikataulu/${this.props.params.patternId || ''}`}
            activeClassName="is-active"
          >
            <div>
              <Icon img="icon-icon_schedule" />
              <FormattedMessage id="timetable" defaultMessage="Timetable" />
            </div>
          </Link>
          <Link
            to={`/linjat/${this.props.route.gtfsId}/hairiot`}
            activeClassName="is-active"
            className={cx({
              activeAlert: this.props.route.alerts && this.props.route.alerts.length > 0,
            })}
          >
            <div>
              <Icon img="icon-icon_caution" />
              <FormattedMessage id="disruptions" defaultMessage="Disruptions" />
            </div>
          </Link>
          <FavouriteRouteContainer
            className="route-page-header"
            gtfsId={this.props.route.gtfsId}
          />
        </nav>
        {this.props.params.patternId && <RoutePatternSelect
          params={this.props.params}
          route={this.props.route}
          onSelectChange={this.onPatternChange}
          className={cx({ 'bp-large': this.context.breakpoint === 'large' })}
        />}
        <RouteAgencyInfo route={this.props.route} />
      </div>
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
        ${RouteAgencyInfo.getFragment('route')}
        ${RoutePatternSelect.getFragment('route')}
        alerts
      }
    `,
  },
});
