import PropTypes from 'prop-types';
import React from 'react';
import get from 'lodash/get';
import xor from 'lodash/xor';
import { intlShape, FormattedMessage } from 'react-intl';
import { routerShape } from 'react-router';
import * as ModeUtils from '../util/modeUtils';
import Icon from './Icon';
import IconWithBigCaution from './IconWithBigCaution';
import FareZoneSelector from './FareZoneSelector';
import {
  getCustomizedSettings,
  resetCustomizedSettings,
} from '../store/localStorage';
import { defaultSettings } from './../util/planParamUtil';
import Select from './Select';

import PreferredRoutes from './PreferredRoutes';
import ResetCustomizedSettingsButton from './ResetCustomizedSettingsButton';
import SaveCustomizedSettingsButton from './SaveCustomizedSettingsButton';

import StreetModeSelectorPanel from './StreetModeSelectorPanel';

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
    // Implement preferred routes feature here
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
        <div className="option-checbox" tabIndex={0} onKeyPress={() => this.toggleTransportMode(o.name)}>
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

  getSelectOptions = selectOptions =>
    selectOptions.map(o => (
      <div className="option-container" key={o.title}>
        <h1>
          {this.context.intl.formatMessage({
            id: o.title,
            defaultMessage: 'option',
          })}
        </h1>
        <div className="select-container">
          <Select
            name={o.title}
            selected={o.currentSelection}
            options={o.options}
            onSelectChange={e =>
              this.updateParameters({
                [o.paramTitle]: e.target.value,
              })
            }
          />
          <Icon className="fake-select-arrow" img="icon-icon_arrow-dropdown" />
        </div>
      </div>
    ));

  getCurrentOptions = () => {
    const { location, config } = this.context;
    const customizedSettings = getCustomizedSettings();
    const urlParameters = location.query;
    const defaultValues = defaultSettings;
    defaultValues.modes = ModeUtils.getAvailableTransportModeConfigs(
      config,
    ).map(o => o.name);

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

  updateParameters = value => {
    this.context.router.replace({
      ...this.context.location,
      query: {
        ...this.context.location.query,
        ...value,
      },
    });
  };

  resetParameters = () => {
    resetCustomizedSettings();
    this.replaceParams({
      walkSpeed: defaultSettings.walkSpeed,
      walkReluctance: defaultSettings.walkReluctance,
      walkBoardCost: defaultSettings.walkBoardCost,
      minTransferTime: defaultSettings.minTransferTime,
      accessibilityOption: defaultSettings.accessibilityOption,
      modes: ModeUtils.getDefaultModes(this.context.config).toString(),
      ticketTypes: defaultSettings.ticketTypes,
    });
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

  replaceParams = newParams =>
    this.context.router.replace({
      ...this.context.location,
      query: {
        ...this.context.location.query,
        ...newParams,
      },
    });

  renderAccesibilitySelector = val => (
    <div className="settings-option-container accessibility-options-selector">
      {this.getSelectOptions([
        {
          title: 'accessibility',
          paramTitle: 'accessibilityOption',
          currentSelection: val,
          options: this.context.config.accessibilityOptions.map((o, i) => ({
            displayNameObject: (
              <FormattedMessage
                defaultMessage={
                  this.context.config.accessibilityOptions[i].displayName
                }
                id={this.context.config.accessibilityOptions[i].messageId}
              />
            ),
            displayName: this.context.config.accessibilityOptions[i]
              .displayName,
            value: this.context.config.accessibilityOptions[i].value,
          })),
        },
      ])}
    </div>
  );

  renderBikingOptions = val => (
    <div className="settings-option-container bike-options-selector">
      {this.getSelectOptions([
        {
          title: 'biking-amount',
          paramTitle: 'bikingAmount',
          currentSelection: val,
          options: [
            {
              displayName: 'biking-amount-default',
              displayNameObject: this.context.intl.formatMessage({
                id: 'biking-amount-default',
                defaultMessage: 'Oletusarvo',
              }),
              value: 'biking-amount-default',
            },
          ],
        },
        {
          title: 'biking-speed',
          options: [
            {
              displayName: 'biking-speed-default',
              displayNameObject: this.context.intl.formatMessage({
                id: 'biking-speed-default',
                defaultMessage: 'Hidas 30m/min',
              }),
              value: 'biking-speed-default',
            },
          ],
        },
      ])}
    </div>
  );

  renderWalkingOptions = val => (
    <div className="settings-option-container walk-options-selector">
      {this.getSelectOptions([
        {
          title: 'walking',
          paramTitle: 'walkReluctance',
          currentSelection: val,
          options: [
            {
              displayName: 'walking-amount-default',
              displayNameObject: this.context.intl.formatMessage({
                id: 'walking-amount-default',
                defaultMessage: 'Oletusarvo',
              }),
              value: 'walking-amount-default',
            },
          ],
        },
        {
          title: 'walking-speed',
          paramTitle: 'walkSpeed',
          options: [
            {
              displayName: 'walking-speed-default',
              displayNameObject: this.context.intl.formatMessage({
                id: 'walking-speed-default',
                defaultMessage: 'Hidas 30m/min',
              }),
              value: 'walking-speed-default',
            },
          ],
        },
      ])}
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
            optionName: 'parks',
            defaultMessage: 'Parks',
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
            optionName: 'avoid-dangerous-routes',
            defaultMessage: 'Avoid dangerous routes',
          },
          {
            optionName: 'winter-maintenance',
            defaultMessage: 'Routes with winter maintenance',
          },
          {
            optionName: 'illuminated-routes',
            defaultMessage: 'Illuminated routes',
          },
          {
            optionName: 'asphalt-covered',
            defaultMessage: 'Prefer asphalt covered roads',
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

  renderStreetModeSelector = (config, router) =>
    config.features.showStreetModeQuickSelect && (
      <div className="settings-option-container street-mode-selector-panel-container">
        <StreetModeSelectorPanel
          selectedStreetMode={ModeUtils.getStreetMode(router.location, config)}
          selectStreetMode={(streetMode, isExclusive) =>
            ModeUtils.setStreetMode(streetMode, config, router, isExclusive)
          }
          streetModeConfigs={ModeUtils.getAvailableStreetModeConfigs(config)}
          viewid="customized-settings"
        />
      </div>
    );

  renderTransferOptions = val => (
    <div className="settings-option-container transfer-options-container">
      {this.getSelectOptions([
        {
          title: 'transfers',
          paramTitle: 'walkBoardCost',
          currentSelection: val,
          options: [
            {
              displayName: 'transfer-amount',
              displayNameObject: this.context.intl.formatMessage({
                id: 'default-transfer-amount',
                defaultMessage: 'Oletusarvo',
              }),
              value: 'default-transfer-amount',
            },
          ],
        },
        {
          title: 'transfers-margin',
          paramTitle: 'minTransferTime',
          options: [
            {
              displayName: 'transfer-margin-default',
              displayNameObject: this.context.intl.formatMessage({
                id: 'transfer-margin-default',
                defaultMessage: '3 minuuttia',
              }),
              value: 'transfer-margin-default',
            },
          ],
        },
      ])}
    </div>
  );

  renderTransportModeSelector = (config, currentModes) => (
    <div className="settings-option-container transport-mode-selector-container">
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
              ? this.renderBikingOptions()
              : this.renderWalkingOptions()}
            {this.renderTransferOptions(currentOptions.minTransferTime)}
            <FareZoneSelector
              headerText={this.context.intl.formatMessage({
                id: 'zones',
                defaultMessage: 'Fare zones',
              })}
              options={get(this.context.config, 'fareMapping', {})}
              currentOption={merged.ticketTypes || 'none'}
              updateValue={newval =>
                this.replaceParams({ ticketTypes: newval })
              }
            />
            <PreferredRoutes />
            {this.renderRoutePreferences()}
            {this.renderAccesibilitySelector(
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
