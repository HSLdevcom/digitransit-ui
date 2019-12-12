import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';

import { StreetMode } from '../constants';
import Icon from './Icon';
import FareZoneSelector from './FareZoneSelector';
import PreferredRoutes from './PreferredRoutes';
import ResetCustomizedSettingsButton from './ResetCustomizedSettingsButton';
import SaveCustomizedSettingsButton from './SaveCustomizedSettingsButton';
import LoadCustomizedSettingsButton from './LoadCustomizedSettingsButton';
import StreetModeSelectorPanel from './StreetModeSelectorPanel';
import BikeTransportOptionsSection from './customizesearch/BikeTransportOptionsSection';
import BikingOptionsSection from './customizesearch/BikingOptionsSection';
import RoutePreferencesSection from './customizesearch/RoutePreferencesSection';
import SelectOptionContainer from './customizesearch/SelectOptionContainer';
import TransferOptionsSection from './customizesearch/TransferOptionsSection';
import TransportModesSection from './customizesearch/TransportModesSection';
import WalkingOptionsSection from './customizesearch/WalkingOptionsSection';
import CityBikeNetworkSelector from './CityBikeNetworkSelector';
import { resetCustomizedSettings } from '../store/localStorage';
import * as ModeUtils from '../util/modeUtils';
import { getDefaultSettings, getCurrentSettings } from '../util/planParamUtil';
import {
  addPreferredRoute,
  addUnpreferredRoute,
  clearQueryParams,
  removePreferredRoute,
  removeUnpreferredRoute,
  replaceQueryParams,
} from '../util/queryUtils';
import { updateCitybikeNetworks, getCitybikeNetworks } from '../util/citybikes';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class CustomizeSearch extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    onToggleClick: PropTypes.func.isRequired,
  };

  defaultSettings = getDefaultSettings(this.context.config);

  onRouteSelected = (val, preferType) => {
    const routeToAdd = val.properties.gtfsId.replace(':', '__');
    if (preferType === 'preferred') {
      addPreferredRoute(this.context.router, routeToAdd);
    } else {
      addUnpreferredRoute(this.context.router, routeToAdd);
    }
  };

  removeRoute = (routeToRemove, preferType) => {
    if (preferType === 'preferred') {
      removePreferredRoute(this.context.router, routeToRemove);
    } else {
      removeUnpreferredRoute(this.context.router, routeToRemove);
    }
  };

  resetParameters = () => {
    resetCustomizedSettings();
    clearQueryParams(this.context.router, Object.keys(this.defaultSettings));
  };

  render() {
    const {
      config,
      location: { query },
      intl,
      router,
    } = this.context;
    const {
      config: { accessibilityOptions },
    } = this.context;
    const { onToggleClick } = this.props;
    const currentSettings = getCurrentSettings(config, query);
    const isUsingBicycle = currentSettings.modes.includes(StreetMode.Bicycle);
    let ticketOptions = [];
    if (config.showTicketSelector && config.availableTickets) {
      Object.keys(config.availableTickets).forEach(key => {
        if (config.feedIds.indexOf(key) > -1) {
          ticketOptions = ticketOptions.concat(
            Object.keys(config.availableTickets[key]),
          );
        }
      });

      ticketOptions.sort((a, b) => {
        return a.split('').reverse() > b.split('').reverse() ? 1 : -1;
      });
    }

    return (
      <div className="customize-search">
        <button className="close-offcanvas" onClick={onToggleClick}>
          <Icon className="close-icon" img="icon-icon_close" />
        </button>
        <div className="settings-option-container">
          <StreetModeSelectorPanel
            className="customized-settings"
            selectedStreetMode={ModeUtils.getStreetMode(
              router.location,
              config,
            )}
            selectStreetMode={(streetMode, isExclusive) => {
              ModeUtils.setStreetMode(streetMode, config, router, isExclusive);
              addAnalyticsEvent({
                action: 'SelectTravelingModeFromSettings',
                category: 'ItinerarySettings',
                name: streetMode,
              });
            }}
            showButtonTitles
            streetModeConfigs={ModeUtils.getAvailableStreetModeConfigs(config)}
          />
        </div>
        {isUsingBicycle && (
          <div className="settings-option-container">
            <BikeTransportOptionsSection currentModes={currentSettings.modes} />
          </div>
        )}
        <div className="settings-option-container">
          <TransportModesSection
            config={config}
            currentModes={currentSettings.modes}
          />
        </div>
        <div className="settings-option-container">
          {isUsingBicycle ? (
            <BikingOptionsSection
              walkReluctance={currentSettings.walkReluctance}
              walkReluctanceOptions={config.defaultOptions.walkReluctance}
              bikeSpeed={currentSettings.bikeSpeed}
              defaultSettings={this.defaultSettings}
            />
          ) : (
            <WalkingOptionsSection
              walkReluctance={currentSettings.walkReluctance}
              walkReluctanceOptions={config.defaultOptions.walkReluctance}
              walkSpeed={currentSettings.walkSpeed}
              defaultSettings={this.defaultSettings}
            />
          )}
        </div>
        <div className="settings-option-container">
          <TransferOptionsSection
            walkBoardCost={currentSettings.walkBoardCost}
            walkBoardCostOptions={config.defaultOptions.walkBoardCost}
            minTransferTime={currentSettings.minTransferTime}
            defaultSettings={this.defaultSettings}
          />
        </div>
        {config.showTicketSelector && (
          <FareZoneSelector
            headerText={intl.formatMessage({
              id: 'zones',
              defaultMessage: 'Fare zones',
            })}
            options={ticketOptions}
            currentOption={currentSettings.ticketTypes || 'none'}
            updateValue={value => {
              replaceQueryParams(router, { ticketTypes: value });
              addAnalyticsEvent({
                category: 'ItinerarySettings',
                action: 'ChangeFareZones',
                name: value,
              });
            }}
          />
        )}
        {config.cityBike.networks &&
          Object.keys(config.cityBike.networks).length > 1 &&
          config.transportModes.citybike &&
          config.transportModes.citybike.availableForSelection && (
            <CityBikeNetworkSelector
              headerText={intl.formatMessage({
                id: 'citybike-network-headers',
                defaultMessage: 'Citybikes and scooters',
              })}
              isUsingCitybike={currentSettings.modes.includes('CITYBIKE')}
              currentOptions={getCitybikeNetworks(router.location, config)}
              updateValue={value =>
                updateCitybikeNetworks(
                  getCitybikeNetworks(router.location, config),
                  value.toUpperCase(),
                  config,
                  router,
                  currentSettings.modes.includes('CITYBIKE'),
                )
              }
            />
          )}
        <PreferredRoutes
          onRouteSelected={this.onRouteSelected}
          preferredRoutes={currentSettings.preferredRoutes}
          unPreferredRoutes={currentSettings.unpreferredRoutes}
          removeRoute={this.removeRoute}
        />
        <div className="settings-option-container">
          <RoutePreferencesSection
            optimize={currentSettings.optimize}
            triangleFactors={{
              safetyFactor: currentSettings.safetyFactor,
              slopeFactor: currentSettings.slopeFactor,
              timeFactor: currentSettings.timeFactor,
            }}
            defaultSettings={this.defaultSettings}
          />
        </div>
        <div className="settings-option-container">
          <SelectOptionContainer
            currentSelection={currentSettings.accessibilityOption}
            defaultValue={this.defaultSettings.accessibilityOption}
            options={accessibilityOptions.map((o, i) => ({
              title: accessibilityOptions[i].messageId,
              value: accessibilityOptions[i].value,
            }))}
            onOptionSelected={value => {
              replaceQueryParams(router, {
                accessibilityOption: value,
              });
              addAnalyticsEvent({
                category: 'ItinerarySettings',
                action: 'ChangeAccessibility',
                name: value,
              });
            }}
            title="accessibility"
          />
        </div>
        <div className="settings-option-container save-controls-container">
          <div style={{ display: 'flex' }}>
            <SaveCustomizedSettingsButton
              noSettingsFound={this.resetParameters}
            />
            <LoadCustomizedSettingsButton
              noSettingsFound={this.resetParameters}
            />
          </div>
          <div>
            <ResetCustomizedSettingsButton
              onReset={() => {
                this.resetParameters();
                addAnalyticsEvent({
                  action: 'ResetSettings',
                  category: 'ItinerarySettings',
                  name: null,
                });
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default CustomizeSearch;
