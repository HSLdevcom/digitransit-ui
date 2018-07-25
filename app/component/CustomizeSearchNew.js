import PropTypes from 'prop-types';
import React from 'react';
import get from 'lodash/get';
import xor from 'lodash/xor';
import { intlShape, FormattedMessage } from 'react-intl';
import { routerShape } from 'react-router';

import Checkbox from './Checkbox';
import Icon from './Icon';
import IconWithBigCaution from './IconWithBigCaution';
import FareZoneSelector from './FareZoneSelector';
import PreferredRoutes from './PreferredRoutes';
import ResetCustomizedSettingsButton from './ResetCustomizedSettingsButton';
import SaveCustomizedSettingsButton from './SaveCustomizedSettingsButton';
import StreetModeSelectorPanel from './StreetModeSelectorPanel';
import BikingOptionsSection from './CustomizeSearch/BikingOptionsSection';
import SelectOptionContainer from './CustomizeSearch/SelectOptionContainer';
import WalkingOptionsSection from './CustomizeSearch/WalkingOptionsSection';
import TransferOptionsSection from './CustomizeSearch/TransferOptionsSection';
import {
  getCustomizedSettings,
  resetCustomizedSettings,
} from '../store/localStorage';
import { isKeyboardSelectionEvent } from '../util/browser';
import * as ModeUtils from '../util/modeUtils';
import { defaultSettings } from './../util/planParamUtil';
import { replaceQueryParams } from '../util/queryUtils';

class CustomizeSearch extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    isOpen: PropTypes.bool,
    onToggleClick: PropTypes.func.isRequired,
  };

  static defaultProps = {
    isOpen: false,
  };

  onRouteSelected = val => {
    console.log(val);
    // TODO: Implement preferred routes feature here
  };

  getBikeTransportOptions = val =>
    val.map(o => (
      <Checkbox
        checked={false}
        defaultMessage={o.defaultMessage}
        key={`cb-${o.optionName}`}
        labelId={o.optionName}
        onChange={() => console.log(o.optionName)}
      />
    ));

  getTransportModes = (modes, currentModes) => {
    const isBikeRejected =
      currentModes.filter(o2 => o2 === 'BICYCLE' || o2 === 'BUS').length > 1;
    return modes.map(o => (
      <div
        className="mode-option-container"
        key={`mode-option-${o.name.toLowerCase()}`}
      >
        <Checkbox
          checked={currentModes.filter(o2 => o2 === o.name).length > 0}
          defaultMessage={o.name}
          labelId={o.name.toLowerCase()}
          onChange={() => this.toggleTransportMode(o.name)}
          showLabel={false}
        />
        <div
          role="button"
          tabIndex={0}
          aria-label={`${o.name.toLowerCase()}`}
          className={`mode-option-block ${o.name.toLowerCase()}`}
          onKeyPress={e =>
            isKeyboardSelectionEvent(e) && this.toggleTransportMode(o.name)
          }
          onClick={() => this.toggleTransportMode(o.name)}
        >
          <div className="mode-icon">
            {isBikeRejected && o.name === 'BUS' ? (
              <IconWithBigCaution
                color="currentColor"
                className={o.name.toLowerCase()}
                img={`icon-icon_${o.name.toLowerCase()}`}
              />
            ) : (
              <Icon
                className={`${o.name}-icon`}
                img={`icon-icon_${o.name.toLowerCase()}`}
              />
            )}
          </div>
          <div className="mode-name">
            <FormattedMessage
              id={o.name.toLowerCase()}
              defaultMessage={o.name.toLowerCase()}
            />
            {isBikeRejected &&
              o.name === 'BUS' && (
                <span className="span-bike-not-allowed">
                  {this.context.intl.formatMessage({
                    id: 'bike-not-allowed',
                    defaultMessage: 'Bikes are not allowed on the bus',
                  })}
                </span>
              )}
          </div>
        </div>
      </div>
    ));
  };

  getCurrentOptions = () => {
    const { location, config } = this.context;
    const customizedSettings = getCustomizedSettings();
    const urlParameters = location.query;
    const defaultValues = defaultSettings;
    defaultValues.modes = ModeUtils.getDefaultModes(config);

    const obj = {};

    if (urlParameters) {
      Object.keys(defaultValues).forEach(key => {
        obj[key] = urlParameters[key] ? urlParameters[key] : defaultValues[key];
      });
    } else if (customizedSettings) {
      Object.keys(defaultValues).forEach(key => {
        obj[key] = urlParameters[key] ? urlParameters[key] : defaultValues[key];
      });
    }
    return obj;
  };

  getRoutePreferences = () => [
    {
      name: 'paved',
      defaultMessage: 'Prefer paved routes',
    },
    {
      name: 'greenways',
      defaultMessage: 'Prefer cycleways',
    },
    {
      name: 'winter-maintenance',
      defaultMessage: 'Prefer routes with winter maintenance',
    },
    {
      name: 'illuminated',
      defaultMessage: 'Prefer illuminated routes',
    },
  ];

  checkAndConvertModes = modes => {
    if (!Array.isArray(modes)) {
      return modes.match(/,/) ? modes.split(',') : [modes];
    } else if (Array.isArray(modes)) {
      return modes;
    }
    return [];
  };

  resetParameters = () => {
    const defaultValues = defaultSettings;
    defaultValues.modes = ModeUtils.getDefaultModes(
      this.context.config,
    ).toString();
    resetCustomizedSettings();
    replaceQueryParams(this.context.router, defaultValues);
  };

  toggleTransportMode(mode, otpMode) {
    this.context.router.replace({
      ...this.context.location,
      query: {
        ...this.context.location.query,
        modes: xor(
          ModeUtils.getModes(this.context.location, this.context.config),
          [(otpMode || mode).toUpperCase()],
        ).join(','),
      },
    });
  }

  renderAccessibilitySelector = accessibilityOption => {
    const {
      config: { accessibilityOptions },
    } = this.context;
    return (
      <div className="settings-option-container">
        <SelectOptionContainer
          currentSelection={accessibilityOption}
          defaultValue={defaultSettings.accessibilityOption}
          options={accessibilityOptions.map((o, i) => ({
            title: accessibilityOptions[i].messageId,
            value: accessibilityOptions[i].value,
          }))}
          onOptionSelected={value =>
            replaceQueryParams(this.context.router, {
              accessibilityOption: value,
            })
          }
          title="accessibility"
        />
      </div>
    );
  };

  renderBikeTransportSelector = () => (
    <div className="settings-option-container">
      {this.getBikeTransportOptions([
        {
          optionName: 'biketransport-only-bike',
          defaultMessage: "I'm travelling only by bike",
        },
        {
          optionName: 'biketransport-citybike',
          defaultMessage: "I'm using a citybike",
        },
        {
          optionName: 'biketransport-keep-bike-with',
          defaultMessage: 'I want to keep my bike with me',
        },
      ])}
    </div>
  );

  renderRoutePreferences = () => (
    <div className="settings-option-container route-preferences-container">
      <h1>
        {this.context.intl.formatMessage({
          id: 'route-preferences',
        })}
      </h1>
      {this.getRoutePreferences().map(o => (
        <Checkbox
          checked={false}
          defaultMessage={o.defaultMessage}
          key={`cb-${o.name}`}
          labelId={o.name}
          onChange={e => console.log(e.target)}
        />
      ))}
    </div>
  );

  renderStreetModeSelector = (config, router) => (
    <div className="settings-option-container street-mode-selector-panel-container">
      <StreetModeSelectorPanel
        className="customized-settings"
        selectedStreetMode={ModeUtils.getStreetMode(router.location, config)}
        selectStreetMode={(streetMode, isExclusive) =>
          ModeUtils.setStreetMode(streetMode, config, router, isExclusive)
        }
        showButtonTitles
        streetModeConfigs={ModeUtils.getAvailableStreetModeConfigs(config)}
      />
    </div>
  );

  renderTransportModeSelector = (config, currentModes) => (
    <div className="settings-option-container">
      <div className="transport-mode-header">
        <h1>
          {this.context.intl.formatMessage({
            id: 'public-transport',
            defaultMessage: 'Public Transport',
          })}
        </h1>
      </div>
      <div className="transport-mode-subheader">
        <FormattedMessage
          id="pick-mode"
          defaultMessage="Pick a transport mode"
        />
      </div>
      <div className="transport-modes-container">
        {this.getTransportModes(
          ModeUtils.getAvailableTransportModeConfigs(config),
          currentModes,
        )}
      </div>
    </div>
  );

  render() {
    const { config, router } = this.context;
    const currentOptions = this.getCurrentOptions();
    const merged = {
      ...defaultSettings,
      ...getCustomizedSettings(),
      ...this.context.location.query,
    };

    const checkedModes = this.checkAndConvertModes(currentOptions.modes);
    return (
      <div
        aria-hidden={!this.props.isOpen}
        role="button"
        tabIndex={0}
        className="customize-search-wrapper"
        // Clicks to the transparent area and close arrow should close the offcanvas
        onClick={this.props.onToggleClick}
        onKeyPress={this.props.onToggleClick}
      >
        <div
          className="customize-search"
          // Clicks musn't bubble to prevent wrapper from closing the offcanvas
          role="button"
          onClick={e => e.stopPropagation()}
          onKeyPress={e => e.stopPropagation()}
          tabIndex={0}
        >
          <section className="offcanvas-section">
            <button
              className="close-offcanvas"
              onClick={this.props.onToggleClick}
              onKeyPress={this.props.onToggleClick}
            >
              <Icon className="close-icon" img="icon-icon_close" />
            </button>
            {this.renderStreetModeSelector(config, router)}
            {checkedModes.filter(o => o === 'BICYCLE').length > 0 &&
              this.renderBikeTransportSelector(checkedModes)}
            {this.renderTransportModeSelector(config, checkedModes)}
            <div className="settings-option-container">
              {checkedModes.filter(o => o === 'BICYCLE').length > 0 ? (
                <BikingOptionsSection
                  walkReluctance={currentOptions.walkReluctance}
                  bikeSpeed={currentOptions.bikeSpeed}
                />
              ) : (
                <WalkingOptionsSection
                  walkReluctance={currentOptions.walkReluctance}
                  walkSpeed={currentOptions.walkSpeed}
                />
              )}
            </div>
            <div className="settings-option-container">
              <TransferOptionsSection
                walkBoardCost={currentOptions.walkBoardCost}
                minTransferTime={currentOptions.minTransferTime}
              />
            </div>
            <FareZoneSelector
              headerText={this.context.intl.formatMessage({
                id: 'zones',
                defaultMessage: 'Fare zones',
              })}
              options={get(this.context.config, 'fareMapping', {})}
              currentOption={merged.ticketTypes || 'none'}
              updateValue={value =>
                replaceQueryParams(this.context.router, { ticketTypes: value })
              }
            />
            <PreferredRoutes onRouteSelected={this.onRouteSelected} />
            {this.renderRoutePreferences()}
            {this.renderAccessibilitySelector(
              currentOptions.accessibilityOption,
            )}
            <div className="settings-option-container save-controls-container">
              <SaveCustomizedSettingsButton />
              <ResetCustomizedSettingsButton onReset={this.resetParameters} />
            </div>
          </section>
        </div>
      </div>
    );
  }
}

export default CustomizeSearch;
