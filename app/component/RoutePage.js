import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import { routerShape } from 'react-router';

import Icon from './Icon';
import CallAgencyWarning from './CallAgencyWarning';
import FavouriteRouteContainer from './FavouriteRouteContainer';
import RoutePatternSelect from './RoutePatternSelect';
import RouteAgencyInfo from './RouteAgencyInfo';
import RouteNumber from './RouteNumber';
import {
  startRealTimeClient,
  stopRealTimeClient,
} from '../action/realTimeClientAction';
import { PREFIX_ROUTES } from '../util/path';
import withBreakpoint from '../util/withBreakpoint';

class RoutePage extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    route: PropTypes.object.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
    params: PropTypes.shape({
      patternId: PropTypes.string.isRequired,
    }).isRequired,
    breakpoint: PropTypes.string.isRequired,
  };

  componentDidMount() {
    const { realTime } = this.context.config;
    if (!realTime || this.props.route == null) {
      return;
    }
    const route = this.props.route.gtfsId.split(':');
    const agency = route[0];
    const source = realTime[agency];
    if (source) {
      // hack: a mapping to fix incorrect feeds
      // e.g. tampere feed defines route shortName instead of gtfsId
      const id = source.routeSelector
        ? this.props.route[source.routeSelector]
        : route[1];
      this.context.executeAction(startRealTimeClient, {
        ...source,
        agency,
        options: [
          {
            route: id,
            // add some information from the context
            // to compensate potentially missing feed data
            mode: this.props.route.mode.toLowerCase(),
            gtfsId: route[1],
          },
        ],
      });
    }
  }

  componentWillUnmount() {
    const { client } = this.context.getStore('RealTimeInformationStore');

    if (client) {
      this.context.executeAction(stopRealTimeClient, client);
    }
  }

  onPatternChange = e => {
    this.context.router.replace(
      decodeURIComponent(this.props.location.pathname).replace(
        new RegExp(`${this.props.params.patternId}(.*)`),
        e.target.value,
      ),
    );
  };

  changeTab = path => {
    this.context.router.replace(path);
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
  render() {
    if (this.props.route == null) {
      /* In this case there is little we can do
       * There is no point continuing rendering as it can only
       * confuse user. Therefore redirect to Routes page */
      this.context.router.replace(`/${PREFIX_ROUTES}`);
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
      <div>
        <div className="header-for-printing">
          <h1>
            <FormattedMessage
              id="print-route-app-title"
              defaultMessage={this.context.config.title}
            />
            {` - `}
            <FormattedMessage id="route-guide" defaultMessage="Route guide" />
          </h1>
        </div>
        {this.props.route.type === 715 && (
          <CallAgencyWarning route={this.props.route} />
        )}
        <div className="tabs route-tabs">
          <nav
            className={cx('tabs-navigation', {
              'bp-large': this.props.breakpoint === 'large',
            })}
          >
            {this.props.breakpoint === 'large' && (
              <RouteNumber
                color={
                  this.props.route.color ? `#${this.props.route.color}` : null
                }
                mode={this.props.route.mode}
                text={this.props.route.shortName}
              />
            )}
            <a
              className={cx({ 'is-active': activeTab === 'pysakit' })}
              onClick={() => {
                this.changeTab(
                  `/${PREFIX_ROUTES}/${this.props.route.gtfsId}/pysakit/${this
                    .props.params.patternId || ''}`,
                );
              }}
            >
              <div>
                <Icon img="icon-icon_bus-stop" />
                <FormattedMessage id="stops" defaultMessage="Stops" />
              </div>
            </a>
            <a
              className={cx({ 'is-active': activeTab === 'aikataulu' })}
              onClick={() => {
                this.changeTab(
                  `/${PREFIX_ROUTES}/${this.props.route.gtfsId}/aikataulu/${this
                    .props.params.patternId || ''}`,
                );
              }}
            >
              <div>
                <Icon img="icon-icon_schedule" />
                <FormattedMessage id="timetable" defaultMessage="Timetable" />
              </div>
            </a>
            <a
              className={cx({
                activeAlert:
                  this.props.route.alerts && this.props.route.alerts.length > 0,
                'is-active': activeTab === 'hairiot',
              })}
              onClick={() => {
                this.changeTab(
                  `/${PREFIX_ROUTES}/${this.props.route.gtfsId}/hairiot`,
                );
              }}
            >
              <div>
                <Icon img="icon-icon_caution" />
                <FormattedMessage
                  id="disruptions"
                  defaultMessage="Disruptions"
                />
              </div>
            </a>
            <FavouriteRouteContainer
              className="route-page-header"
              gtfsId={this.props.route.gtfsId}
            />
          </nav>
          {this.props.params.patternId && (
            <RoutePatternSelect
              params={this.props.params}
              route={this.props.route}
              onSelectChange={this.onPatternChange}
              gtfsId={this.props.route.gtfsId}
              activeTab={activeTab}
              className={cx({
                'bp-large': this.props.breakpoint === 'large',
              })}
            />
          )}
          <RouteAgencyInfo route={this.props.route} />
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(withBreakpoint(RoutePage), {
  fragments: {
    route: () =>
      Relay.QL`
      fragment on Route {
        gtfsId
        color
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
