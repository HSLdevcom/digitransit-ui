import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import Toggle from 'material-ui/Toggle';

import Icon from './Icon';
import FareZoneSelector from './FareZoneSelector';
import ResetCustomizedSettingsButton from './ResetCustomizedSettingsButton';
import SaveCustomizedSettingsButton from './SaveCustomizedSettingsButton';
import LoadCustomizedSettingsButton from './LoadCustomizedSettingsButton';
import StreetModeSelectorPanel from './StreetModeSelectorPanel';
import TransferOptionsSection from './customizesearch/TransferOptionsSection';
import TransportModesSection from './customizesearch/TransportModesSection';
import WalkingOptionsSection from './customizesearch/WalkingOptionsSection';
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
import { addAnalyticsEvent } from '../util/analyticsUtils';

class CustomizeSearch extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    onToggleClick: PropTypes.func.isRequired,
  };

  defaultSettings = getDefaultSettings(this.context.config);

  onRouteSelected = (val, preferType) => {
    const routeToAdd = val.properties.gtfsId.replace(':', '__');
    if (preferType === 'preferred') {
      addPreferredRoute(this.context.router, routeToAdd, this.context.match);
    } else {
      addUnpreferredRoute(this.context.router, routeToAdd, this.context.match);
    }
  };

  removeRoute = (routeToRemove, preferType) => {
    if (preferType === 'preferred') {
      removePreferredRoute(
        this.context.router,
        routeToRemove,
        this.context.match,
      );
    } else {
      removeUnpreferredRoute(
        this.context.router,
        routeToRemove,
        this.context.match,
      );
    }
  };

  resetParameters = () => {
    resetCustomizedSettings();
    clearQueryParams(
      this.context.router,
      this.context.match,
      Object.keys(this.defaultSettings),
    );
  };

  render() {
    const { config, match, intl, router } = this.context;
    const { onToggleClick } = this.props;
    const currentSettings = getCurrentSettings(config, match.location.query);
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
          <h1>
            {intl.formatMessage({
              id: 'customize-search-header',
              defaultMessage: 'Settings',
            })}
          </h1>
        </div>
        <div className="settings-option-container">
          <WalkingOptionsSection
            walkReluctance={currentSettings.walkReluctance}
            walkReluctanceOptions={config.defaultOptions.walkReluctance}
            walkSpeed={currentSettings.walkSpeed}
            defaultSettings={this.defaultSettings}
          />
        </div>
        <div className="settings-option-container">
          <TransportModesSection
            config={config}
            currentModes={currentSettings.modes}
          />
        </div>
        <div className="settings-option-container">
          <TransferOptionsSection
            defaultSettings={this.defaultSettings}
            currentSettings={currentSettings}
            walkBoardCostHigh={config.walkBoardCostHigh}
          />
        </div>
        <div className="settings-option-container">
          <StreetModeSelectorPanel
            selectedStreetMode={ModeUtils.getStreetMode(match.location, config)}
            selectStreetMode={(streetMode, isExclusive) => {
              ModeUtils.setStreetMode(
                streetMode,
                config,
                router,
                match,
                isExclusive,
              );
              addAnalyticsEvent({
                action: 'SelectTravelingModeFromSettings',
                category: 'ItinerarySettings',
                name: streetMode,
              });
            }}
            streetModeConfigs={ModeUtils.getAvailableStreetModeConfigs(config)}
            currentSettings={currentSettings}
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
              replaceQueryParams(router, match, { ticketTypes: value });
              addAnalyticsEvent({
                category: 'ItinerarySettings',
                action: 'ChangeFareZones',
                name: value,
              });
            }}
          />
        )}
        <div className="settings-option-container">
          <Toggle
            toggled={!!currentSettings.usingWheelchair} // converts to int to bool
            title="accessibility"
            label="Wheelchair"
            labelStyle={{ color: '#707070' }}
            onToggle={(event, isInputChecked) => {
              replaceQueryParams(router, match, {
                usingWheelchair: isInputChecked ? 1 : 0,
              });
            }}
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
