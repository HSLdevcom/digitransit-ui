import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import Toggle from './Toggle';
import Icon from './Icon';
import {
  mapDefaultNetworkProperties,
  getCityBikeNetworkName,
  getCityBikeNetworkConfig,
  updateCitybikeNetworks,
  getCitybikeNetworks,
} from '../util/citybikes';

class CityBikeNetworkSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentOptions: props.currentOptions,
    };
  }

  render() {
    const { isUsingCitybike } = this.props;
    const { config, getStore, match, router } = this.context;
    return (
      <React.Fragment>
        {mapDefaultNetworkProperties(config).map(network => (
          <div
            className="mode-option-block citybike-network-container"
            key={`cb-${network.networkName}`}
            style={{ height: '2.5em' }}
          >
            <Icon
              className={`${network.icon}-icon`}
              img={`icon-icon_${network.icon}`}
              height={0.5}
              width={0.5}
            />
            <Toggle
              toggled={
                isUsingCitybike &&
                this.state.currentOptions.filter(
                  option =>
                    option.toUpperCase() === network.networkName.toUpperCase(),
                ).length > 0
              }
              label={getCityBikeNetworkName(
                getCityBikeNetworkConfig(network.networkName, config),
                getStore('PreferencesStore').getLanguage(),
              )}
              onToggle={() => {
                this.setState({
                  currentOptions: updateCitybikeNetworks(
                    getCitybikeNetworks(config),
                    network.networkName.toUpperCase(),
                    config,
                    router,
                    isUsingCitybike,
                    match,
                  ),
                });
              }}
            />
          </div>
        ))}
      </React.Fragment>
    );
  }
}

CityBikeNetworkSelector.propTypes = {
  currentOptions: PropTypes.array.isRequired,
  isUsingCitybike: PropTypes.bool.isRequired,
};

CityBikeNetworkSelector.contextTypes = {
  config: PropTypes.object.isRequired,
  getStore: PropTypes.func.isRequired,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
};

export default CityBikeNetworkSelector;
