import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';
import Icon from './Icon';

class PreferredRoutes extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    onRouteSelected: PropTypes.func.isRequired,
    preferredRoutes: PropTypes.array,
    unPreferredRoutes: PropTypes.array,
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
        searchType="all"
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
              <button onClick={e => console.log(e)}>
                <Icon className="close-icon" img="icon-icon_close" />
              </button>
              {o}
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
        {console.log(this.props.preferredRoutes)}
        {this.renderPreferredRouteNumbers()}
        {this.renderAvoidingRoutes()}
      </div>
    );
  }
}
export default PreferredRoutes;
