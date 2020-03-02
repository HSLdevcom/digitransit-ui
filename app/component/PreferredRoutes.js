import PropTypes from 'prop-types';
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { intlShape } from 'react-intl';
import { routerShape } from 'found';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';
import Icon from './Icon';
import RouteDetails from './RouteDetails';
import getRelayEnvironment from '../util/getRelayEnvironment';

class PreferredRoutes extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    onRouteSelected: PropTypes.func.isRequired,
    preferredRoutes: PropTypes.arrayOf(PropTypes.string),
    unPreferredRoutes: PropTypes.arrayOf(PropTypes.string),
    removeRoute: PropTypes.func.isRequired,
    relayEnvironment: PropTypes.object.isRequired,
  };

  static defaultProps = {
    preferredRoutes: [],
    unPreferredRoutes: [],
  };

  getPreferredRouteNumbers = routeOptions => (
    <div className="preferred-routes-input-container">
      <h1>
        {this.context.intl.formatMessage({
          id: routeOptions.optionName,
          defaultMessage: routeOptions.optionName,
        })}
      </h1>
      <DTEndpointAutosuggest
        placeholder="give-route"
        searchType="search"
        className={routeOptions.optionName}
        onLocationSelected={e => e.stopPropagation()}
        onRouteSelected={val =>
          this.props.onRouteSelected(val, routeOptions.optionName)
        }
        id={`searchfield-${routeOptions.optionName}`}
        refPoint={{ lat: 0, lon: 0 }}
        layers={['Geocoding']}
        value=""
        isPreferredRouteSearch
      />
      <div className="preferred-routes-list">
        {routeOptions.preferredRoutes &&
          routeOptions.preferredRoutes.map(o => (
            <div className="route-name" key={o}>
              <button
                onClick={() =>
                  this.props.removeRoute(o, routeOptions.optionName)
                }
              >
                <Icon className="close-icon" img="icon-icon_close" />
              </button>
              <QueryRenderer
                query={graphql`
                  query PreferredRoutesQuery($gtfsId: String!) {
                    route(id: $gtfsId) {
                      ...RouteDetails_route
                    }
                  }
                `}
                environment={this.props.relayEnvironment}
                variables={{ gtfsId: o.replace('__', ':') }}
                render={({ props }) => <RouteDetails {...props} />}
              />
            </div>
          ))}
      </div>
    </div>
  );

  renderAvoidingRoutes = () => (
    <div className="avoid-routes-container">
      {this.getPreferredRouteNumbers({
        optionName: 'unpreferred',
        preferredRoutes: this.props.unPreferredRoutes,
      })}
    </div>
  );

  renderPreferredRouteNumbers = () => (
    <div className="preferred-routes-container">
      {this.getPreferredRouteNumbers({
        optionName: 'preferred',
        preferredRoutes: this.props.preferredRoutes,
      })}
    </div>
  );

  render() {
    return (
      <div className="settings-option-container">
        {this.renderPreferredRouteNumbers()}
        {this.renderAvoidingRoutes()}
      </div>
    );
  }
}

export default getRelayEnvironment(PreferredRoutes);
