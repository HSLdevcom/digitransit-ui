import PropTypes from 'prop-types';
import React from 'react';
import ceil from 'lodash/ceil';
import get from 'lodash/get';
import xor from 'lodash/xor';
import { intlShape, FormattedMessage } from 'react-intl';
import { routerShape } from 'react-router';

import Icon from './Icon';
import IconWithBigCaution from './IconWithBigCaution';
import FareZoneSelector from './FareZoneSelector';
import {
  getCustomizedSettings,
  resetCustomizedSettings,
} from '../store/localStorage';
import * as ModeUtils from '../util/modeUtils';
import { defaultSettings } from './../util/planParamUtil';
import { replaceQueryParams } from '../util/queryUtils';

import PreferredRoutes from './PreferredRoutes';
import ResetCustomizedSettingsButton from './ResetCustomizedSettingsButton';
import SaveCustomizedSettingsButton from './SaveCustomizedSettingsButton';

import StreetModeSelectorPanel from './StreetModeSelectorPanel';
import SelectOptionContainer, {
  getFiveStepOptions,
  getLinearStepOptions,
  getSpeedOptions,
} from './CustomizeSearch/SelectOptionContainer';

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
      <div
        className="biketransport-option"
        key={`biketransport-${o.optionName}`}
      >
        {/* eslint-disable-next-line */}
        <div className="option-checbox" tabIndex={0}>
          <input
            type="checkbox"
            id={`input-${o.optionName}`}
            onChange={() => console.log(o.optionName)}
            aria-label={this.context.intl.formatMessage({
              id: `biketransport-${o.optionName}`,
              defaultMessage: `${o.defaultMessage}`,
            })}
          />
          {/* eslint-disable jsx-a11y/label-has-for */}
          <label htmlFor={`input-${o.optionName}`} />
          {/* eslint-enable jsx-a11y/label-has-for */}
        </div>
        <FormattedMessage
          id={`biketransport-${o.optionName}`}
          defaultMessage={`${o.defaultMessage}`}
        />
      </div>
    ));

  getTransportModes = (modes, currentModes) => {
    const isBikeRejected =
      currentModes.filter(o2 => o2 === 'BICYCLE' || o2 === 'BUS').length > 1;
    return modes.map((o, i) => (
      <div
        className="mode-option-container"
        key={`mode-option-${o.name.toLowerCase()}`}
      >
        {/* eslint-disable-next-line */}
        <div
          className="option-checbox"
          tabIndex={0} // eslint-disable-line
          onKeyPress={() => this.toggleTransportMode(o.name)}
        >
          <input
            type="checkbox"
            checked={currentModes.filter(o2 => o2 === o.name).length > 0}
            id={`input-${o.name}`}
            onChange={() => this.toggleTransportMode(o.name)}
            aria-label={this.context.intl.formatMessage({
              id: `${o.name.toLowerCase()}`,
              defaultMessage: `${o.name}`,
            })}
          />
          {/* eslint-disable jsx-a11y/label-has-for */}
          <label htmlFor={`input-${o.name}`} />
          {/* eslint-enable jsx-a11y/label-has-for */}
        </div>
        <div
          role="button"
          tabIndex={0}
          aria-label={`${o.name.toLowerCase()}`}
          className={`mode-option-block ${o.name.toLowerCase()}`}
          style={{
            borderTopLeftRadius: i === 0 && '6px',
            borderTopRightRadius: i === 0 && '6px',
            borderBottomLeftRadius: i === modes.length - 1 && '6px',
            borderBottomRightRadius: i === modes.length - 1 && '6px',
          }}
          onKeyPress={() => this.toggleTransportMode(o.name)}
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

  getRoutePreferences = preferenceOptions => (
    <div className="route-preferences-input-container">
      <h1>
        {this.context.intl.formatMessage({
          id: preferenceOptions.optionName,
          defaultMessage: 'option',
        })}
      </h1>
      {preferenceOptions.options.map(o => (
        <div
          className="routepreferences-option"
          key={`routepreferences-${o.optionName}`}
        >
          <div className="option-checbox">
            <input type="checkbox" onChange={e => console.log(e.target)} />
            {/* eslint-disable jsx-a11y/label-has-for */}
            <label htmlFor={`input-${o.name}`} />
            {/* eslint-enable jsx-a11y/label-has-for */}
          </div>
          <FormattedMessage
            id={`${o.optionName}`}
            defaultMessage={`${o.defaultMessage}`}
          />
        </div>
      ))}
    </div>
  );

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

  checkAndConvertModes = modes => {
    if (!Array.isArray(modes)) {
      return modes.match(/,/) ? modes.split(',') : [modes];
    } else if (Array.isArray(modes)) {
      return modes;
    }
    return [];
  };

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

  renderBikingOptions = (walkReluctance, bikeSpeed) => (
    <div className="settings-option-container">
      {/* OTP uses the same walkReluctance setting for bike routing */}
      <SelectOptionContainer
        currentSelection={walkReluctance}
        defaultValue={defaultSettings.walkReluctance}
        highlightDefaultValue={false}
        onOptionSelected={value =>
          replaceQueryParams(this.context.router, { walkReluctance: value })
        }
        options={getFiveStepOptions(defaultSettings.walkReluctance, true)}
        title="biking-amount"
      />
      <SelectOptionContainer
        currentSelection={bikeSpeed}
        defaultValue={defaultSettings.bikeSpeed}
        displayPattern="kilometers-per-hour"
        displayValueFormatter={value => ceil(value * 3.6, 1)}
        onOptionSelected={value =>
          replaceQueryParams(this.context.router, { bikeSpeed: value })
        }
        options={getSpeedOptions(defaultSettings.bikeSpeed, 10, 21)}
        sortByValue
        title="biking-speed"
      />
    </div>
  );

  renderWalkingOptions = (walkReluctance, walkSpeed) => (
    <div className="settings-option-container">
      <SelectOptionContainer
        currentSelection={walkReluctance}
        defaultValue={defaultSettings.walkReluctance}
        highlightDefaultValue={false}
        onOptionSelected={value =>
          replaceQueryParams(this.context.router, { walkReluctance: value })
        }
        options={getFiveStepOptions(defaultSettings.walkReluctance, true)}
        title="walking"
      />
      <SelectOptionContainer
        currentSelection={walkSpeed}
        defaultValue={defaultSettings.walkSpeed}
        displayPattern="kilometers-per-hour"
        displayValueFormatter={value => ceil(value * 3.6, 1)}
        onOptionSelected={value =>
          replaceQueryParams(this.context.router, { walkSpeed: value })
        }
        options={getSpeedOptions(defaultSettings.walkSpeed, 1, 12)}
        sortByValue
        title="walking-speed"
      />
    </div>
  );

  renderBikeTransportSelector = () => (
    <div className="settings-option-container bike-transport-selector">
      {this.getBikeTransportOptions([
        {
          optionName: 'only-bike',
          defaultMessage: "I'm travelling only by bike",
        },
        {
          optionName: 'citybike',
          defaultMessage: "I'm using a citybike",
        },
        {
          optionName: 'keep-bike-with',
          defaultMessage: 'I want to keep my bike with me',
        },
      ])}
    </div>
  );

  renderRoutePreferences = () => (
    <div className="settings-option-container route-preferences-container">
      {this.getRoutePreferences({
        optionName: 'route-preferences',
        options: [
          {
            optionName: 'paved',
            defaultMessage: 'Prefer paved roads',
          },
          {
            optionName: 'main-roads',
            defaultMessage: 'Main roads',
          },
          {
            optionName: 'light-traffic-roads',
            defaultMessage: 'Light traffic roads',
          },
          {
            optionName: 'winter-maintenance',
            defaultMessage: 'Routes with winter maintenance',
          },
          {
            optionName: 'illuminated-routes',
            defaultMessage: 'Illuminated routes',
          },
        ],
      })}
    </div>
  );

  renderSaveAndResetButton = () => (
    <div className="settings-option-container save-controls-container">
      <SaveCustomizedSettingsButton />
      <ResetCustomizedSettingsButton onReset={this.resetParameters} />
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

  renderTransferOptions = (walkBoardCost, minTransferTime) => (
    <div className="settings-option-container">
      <SelectOptionContainer
        currentSelection={walkBoardCost}
        defaultValue={defaultSettings.walkBoardCost}
        highlightDefaultValue={false}
        onOptionSelected={value =>
          replaceQueryParams(this.context.router, { walkBoardCost: value })
        }
        options={getFiveStepOptions(defaultSettings.walkBoardCost, true)}
        title="transfers"
      />
      <SelectOptionContainer
        currentSelection={minTransferTime}
        defaultValue={defaultSettings.minTransferTime}
        displayPattern="number-of-minutes"
        displayValueFormatter={seconds => seconds / 60}
        onOptionSelected={value =>
          replaceQueryParams(this.context.router, { minTransferTime: value })
        }
        options={getLinearStepOptions(
          defaultSettings.minTransferTime,
          60,
          60,
          12,
        )}
        sortByValue
        title="transfers-margin"
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
      {this.getTransportModes(
        ModeUtils.getAvailableTransportModeConfigs(config),
        currentModes,
      )}
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
            {checkedModes.filter(o => o === 'BICYCLE').length > 0
              ? this.renderBikingOptions(
                  currentOptions.walkReluctance,
                  currentOptions.bikeSpeed,
                )
              : this.renderWalkingOptions(
                  currentOptions.walkReluctance,
                  currentOptions.walkSpeed,
                )}
            {this.renderTransferOptions(
              currentOptions.walkBoardCost,
              currentOptions.minTransferTime,
            )}
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
            {this.renderSaveAndResetButton()}
          </section>
        </div>
      </div>
    );
  }
}

export default CustomizeSearch;
