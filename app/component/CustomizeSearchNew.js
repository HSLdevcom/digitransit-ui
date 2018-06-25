import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import { routerShape } from 'react-router';
import * as ModeUtils from '../util/modeUtils';
import Icon from './Icon';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';
import IconWithBigCaution from './IconWithBigCaution';

import Select from './Select';

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
    // const { properties } = val;
  };

  getBikeTransportOptions = val =>
    val.map(o => (
      <div
        className="biketransport-option"
        key={`biketransport-${o.optionName}`}
      >
        <label
          className="checkbox-container"
          htmlFor={`biketransport-${o.optionName}`}
        >
          <input type="checkbox" id={`biketransport-${o.optionName}`} />
          <span className="checkmark" />
        </label>
        <FormattedMessage
          id={`biketransport-${o.optionName}`}
          defaultMessage={`${o.defaultMessage}`}
        />
      </div>
    ));

  getTransportModes = (modes, currentModes) => {
    console.log(modes);
    const isBikeRejected =
      currentModes.filter(o2 => o2 === 'BICYCLE' || o2 === 'BUS').length > 1;
    return modes.map((o, i) => (
      <div
        className="mode-option-container"
        key={`mode-option-${o.name.toLowerCase()}`}
      >
        <div className="mode-option-checkbox">
          <label
            className="checkbox-container"
            htmlFor={`mode-checkbox-${o.name.toLowerCase()}`}
          >
            <input
              type="checkbox"
              id={`mode-checkbox-${o.name.toLowerCase()}`}
            />
            <span className="checkmark" />
          </label>
        </div>
        <div
          className={`mode-option-block ${o.name.toLowerCase()}`}
          style={{
            borderTopLeftRadius: i === 0 && '6px',
            borderTopRightRadius: i === 0 && '6px',
            borderBottomLeftRadius: i === modes.length - 1 && '6px',
            borderBottomRightRadius: i === modes.length - 1 && '6px',
          }}
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
                className="warning-message-icon"
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

  getPreferredRouteNumbers = routeOptions => (
    <div className="preferred-routes-input-container">
      <h1>
        {this.context.intl.formatMessage({
          id: routeOptions.optionName,
          defaultMessage: routeOptions.optionName,
        })}
      </h1>
      <DTEndpointAutosuggest
        placeholder="Enter route"
        searchType="all"
        className={routeOptions.optionName}
        onLocationSelected={e => e.stopPropagation()}
        onRouteSelected={val => this.onRouteSelected(val)}
        id={`searchfield-${routeOptions.optionName}`}
        refPoint={{ lat: 0, lon: 0 }}
        layers={['CurrentPosition', 'Geocoding', 'OldSearch', 'Stops']}
        value={this.context.intl.formatMessage({
          id: 'enter-route',
          defaultMessage: 'Enter a route',
        })}
        isPreferredRouteSearch
      />
      <div className="preferred-routes-list">
        {routeOptions.preferredRoutes.map(o => (
          <div className="route-name" key={o.name}>
            {o.name}
          </div>
        ))}
      </div>
    </div>
  );

  getRoutePreferences = preferenceOptions => (
    <div className="route-preferences-input-container">
      {preferenceOptions.map(o => (
        <div
          className="routepreferences-option"
          key={`routepreferences-${o.optionName}`}
        >
          <label
            className="checkbox-container"
            htmlFor={`routepreferences-${o.optionName}`}
          >
            <input type="checkbox" id={`routepreferences-${o.optionName}`} />
            <span className="checkmark" />
          </label>
          <FormattedMessage
            id={`routepreferences-${o.optionName}`}
            defaultMessage={`${o.defaultMessage}`}
          />
        </div>
      ))}
    </div>
  );

  getSelectOptions = bikingOptions =>
    bikingOptions.map(o => (
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
            selected={o.options}
            options={o.options}
            onSelectChange={e => console.log(e)}
          />
          <Icon className="fake-select-arrow" img="icon-icon_arrow-dropdown" />
        </div>
      </div>
    ));

  checkAndConvertModes = modes => {
    if (modes) {
      return modes.match(/,/) ? modes.split(',') : [modes];
    }
    return [];
  };

  renderAccesibilitySelector = () => (
    <div className="settings-option-container accessibility-options-selector">
      {this.getSelectOptions([
        {
          title: 'accessibility',
          options: [
            {
              displayName: 'default',
              displayNameObject: this.context.intl.formatMessage({
                id: 'accessibility-limited',
                defaultMessage: 'Wheelchair',
              }),
              value: 'accessibility-limited',
            },
            {
              displayName: 'default',
              displayNameObject: this.context.intl.formatMessage({
                id: 'accessibility-nolimit',
                defaultMessage: 'No wheelchair',
              }),
              value: 'default-value',
            },
          ],
        },
      ])}
    </div>
  );

  renderBikingOptions = () => (
    <div className="settings-option-container bike-options-selector">
      {this.getSelectOptions([
        {
          title: 'biking-amount',
          options: [
            {
              displayName: 'default',
              displayNameObject: this.context.intl.formatMessage({
                id: 'default',
                defaultMessage: 'default-amount',
              }),
              value: 'default-value',
            },
            {
              displayName: 'example-2',
              displayNameObject: this.context.intl.formatMessage({
                id: 'example-2',
                defaultMessage: 'example-2',
              }),
              value: 'default-value',
            },
          ],
        },
        {
          title: 'biking-speed',
          options: [
            {
              displayName: 'default',
              displayNameObject: this.context.intl.formatMessage({
                id: 'default',
                defaultMessage: 'default-speed',
              }),
              value: 'default-value',
            },
            {
              displayName: 'example-2',
              displayNameObject: this.context.intl.formatMessage({
                id: 'example-2',
                defaultMessage: 'example-2',
              }),
              value: 'default-value',
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

  renderAvoidingRoutes = () => (
    <div className="settings-option-container avoid-routes-container">
      {this.getPreferredRouteNumbers({
        optionName: 'avoid-routes',
        preferredRoutes: [
          {
            name: '561',
          },
          {
            name: '611',
          },
        ],
      })}
    </div>
  );

  renderPreferredRouteNumbers = () => (
    <div className="settings-option-container preferred-routes-container">
      {this.getPreferredRouteNumbers({
        optionName: 'prefer-routes',
        preferredRoutes: [
          {
            name: '561',
          },
          {
            name: '611',
          },
        ],
      })}
    </div>
  );

  renderRoutePreferences = () => (
    <div className="settings-option-container route-preferences-container">
      {this.getRoutePreferences([
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
      ])}
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
        />
      </div>
    );

  renderTicketTypeOptions = () => (
    <div className="settings-option-container ticket-options-container">
      {this.getSelectOptions([
        {
          title: 'zones',
          options: [
            {
              displayName: 'ticket-type',
              displayNameObject: this.context.intl.formatMessage({
                id: 'default',
                defaultMessage: 'default-ticket-type',
              }),
              value: 'default-ticket',
            },
          ],
        },
      ])}
    </div>
  );

  renderTransferOptions = () => (
    <div className="settings-option-container transfer-options-container">
      {this.getSelectOptions([
        {
          title: 'transfers',
          options: [
            {
              displayName: 'transfer-amount',
              displayNameObject: this.context.intl.formatMessage({
                id: 'default',
                defaultMessage: 'default-transfer-amount',
              }),
              value: 'default-value',
            },
          ],
        },
        {
          title: 'transfers-margin',
          options: [
            {
              displayName: 'transfer-time-min',
              displayNameObject: this.context.intl.formatMessage({
                id: 'default',
                defaultMessage: 'default-transfer-time-min',
              }),
              value: 'default-value',
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
    const currentModes = this.checkAndConvertModes(
      this.context.location.query.modes,
    );
    console.log(currentModes);
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
            {this.renderStreetModeSelector(config, router)}
            <div className="customized-search-separator-line" />
            {this.renderBikeTransportSelector(currentModes)}
            <div className="customized-search-separator-line" />
            {this.renderTransportModeSelector(config, currentModes)}
            <div className="customized-search-separator-line" />
            {this.renderBikingOptions()}
            <div className="customized-search-separator-line" />
            {this.renderTransferOptions()}
            <div className="customized-search-separator-line" />
            {this.renderTicketTypeOptions()}
            <div className="customized-search-separator-line" />
            {this.renderPreferredRouteNumbers()}
            <div className="customized-search-separator-line" />
            {this.renderAvoidingRoutes()}
            <div className="customized-search-separator-line" />
            {this.renderRoutePreferences()}
            <div className="customized-search-separator-line" />
            {this.renderAccesibilitySelector()}
          </section>
        </div>
      </div>
    );
  }
}

export default CustomizeSearch;
