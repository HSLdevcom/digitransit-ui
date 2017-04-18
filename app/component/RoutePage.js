import React from 'react';
import Relay from 'react-relay';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';

import Icon from './Icon';
import CallAgencyWarning from './CallAgencyWarning';
import FavouriteRouteContainer from './FavouriteRouteContainer';
import RoutePatternSelect from './RoutePatternSelect';
import RouteAgencyInfo from './RouteAgencyInfo';
import RouteNumber from './RouteNumber';
import { startRealTimeClient, stopRealTimeClient } from '../action/realTimeClientAction';

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
    history: React.PropTypes.object.isRequired,
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

  changeTab = (path) => {
    this.context.router.replace(path);
  }

  render() {
    if (this.props.route == null) {
      /* In this case there is little we can do
       * There is no point continuing rendering as it can only
       * confuse user. Therefore redirect to Routes page */
      this.props.history.replace('/linjat');
      return null;
    }

    let activeTab;
    if (this.props.location.pathname.indexOf('/pysakit/') > -1) {
      activeTab = 'pysakit';
    } else if (this.props.location.pathname.indexOf('/aikataulu/') > -1) {
      activeTab = 'aikataulu';
    } else if (this.props.location.pathname.indexOf('/hairiot') > -1) {
      activeTab = 'hairiot';
    }

    return (
      <div>{this.props.route.type === 715 && <CallAgencyWarning route={this.props.route} />}
        <div className="tabs route-tabs">
          <nav className={cx('tabs-navigation', { 'bp-large': this.context.breakpoint === 'large' })}>
            { this.context.breakpoint === 'large' && (
            <RouteNumber mode={this.props.route.mode} text={this.props.route.shortName} />
          )}
            <a
              className={cx({ 'is-active': activeTab === 'pysakit' })}
              onClick={() => { this.changeTab(`/linjat/${this.props.route.gtfsId}/pysakit/${this.props.params.patternId || ''}`); }}
            >
              <div>
                <Icon img="icon-icon_bus-stop" />
                <FormattedMessage id="stops" defaultMessage="Stops" />
              </div>
            </a>
            <a
              className={cx({ 'is-active': activeTab === 'aikataulu' })}
              onClick={() => { this.changeTab(`/linjat/${this.props.route.gtfsId}/aikataulu/${this.props.params.patternId || ''}`); }}
            >
              <div>
                <Icon img="icon-icon_schedule" />
                <FormattedMessage id="timetable" defaultMessage="Timetable" />
              </div>
            </a>
            <a
              className={cx({
                activeAlert: this.props.route.alerts && this.props.route.alerts.length > 0,
                'is-active': activeTab === 'hairiot',
              })}
              onClick={() => { this.changeTab(`/linjat/${this.props.route.gtfsId}/hairiot`); }}
            >
              <div>
                <Icon img="icon-icon_caution" />
                <FormattedMessage id="disruptions" defaultMessage="Disruptions" />
              </div>
            </a>
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
        </div></div>
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
        type
        ${RouteAgencyInfo.getFragment('route')}
        ${RoutePatternSelect.getFragment('route')}
        alerts
        agency {
          phone
        }
      }
    `,
  },
});
