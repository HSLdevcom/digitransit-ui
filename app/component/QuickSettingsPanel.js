import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import xor from 'lodash/xor';
import { routerShape, locationShape } from 'react-router';

import AlertPopUp from './AlertPopUp';
import Icon from './Icon';
import ModeFilter from './ModeFilter';
import RightOffcanvasToggle from './RightOffcanvasToggle';
import TimeSelectorContainer from './TimeSelectorContainer';
import { StreetMode } from '../constants';
import { getCustomizedSettings } from '../store/localStorage';
import {
  getModes,
  isBikeRestricted,
  getStreetMode,
  getDefaultTransportModes,
} from '../util/modeUtils';
import { getDefaultSettings } from '../util/planParamUtil';
import { getQuerySettings, replaceQueryParams } from '../util/queryUtils';

class QuickSettingsPanel extends React.Component {
  static propTypes = {
    hasDefaultPreferences: PropTypes.bool.isRequired,
    timeSelectorStartTime: PropTypes.number,
    timeSelectorEndTime: PropTypes.number,
    timeSelectorServiceTimeRange: PropTypes.object.isRequired,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    piwik: PropTypes.object,
    config: PropTypes.object.isRequired,
  };

  state = {
    isPopUpOpen: false,
  };

  onRequestChange = newState => {
    this.internalSetOffcanvas(newState);
  };

  getOffcanvasState = () =>
    (this.context.location.state &&
      this.context.location.state.customizeSearchOffcanvas) ||
    false;

  setArriveBy = ({ target }) => {
    const arriveBy = target.value;
    if (this.context.piwik != null) {
      this.context.piwik.trackEvent(
        'ItinerarySettings',
        'LeavingArrivingSelection',
        arriveBy === 'true' ? 'SelectArriving' : 'SelectLeaving',
      );
    }
    replaceQueryParams(this.context.router, { arriveBy });
  };

  getApplicableQuickOptionSets = () => {
    const { config, location } = this.context;
    const streetMode = getStreetMode(location, config).toLowerCase();
    if (config.quickOptions[streetMode]) {
      return [
        'fastest-route',
        ...config.quickOptions[streetMode].availableOptionSets,
      ];
    }
    return ['fastest-route'];
  };

  getQuickOptionSet = () => {
    const { config } = this.context;
    const defaultSettings = getDefaultSettings(config);
    delete defaultSettings.modes;

    const quickOptionSets = {
      'fastest-route': {
        ...defaultSettings,
      },
      'least-transfers': {
        ...defaultSettings,
        transferPenalty: 5460,
        walkBoardCost: 600,
        walkReluctance: 3,
      },
      'least-walking': {
        ...defaultSettings,
        walkBoardCost: 360,
        walkReluctance: 5,
      },
      'public-transport-with-bicycle': {
        // TODO
        ...defaultSettings,
        modes: [StreetMode.Bicycle, ...getDefaultTransportModes(config)],
      },
      'prefer-walking-routes': {
        ...defaultSettings,
        optimize: 'SAFE',
      },
      'prefer-cycling-routes': {
        ...defaultSettings,
        optimize: 'GREENWAYS',
      },
    };
    return pick(quickOptionSets, this.getApplicableQuickOptionSets());
  };

  setQuickOption = name => {
    if (this.context.piwik != null) {
      this.context.piwik.trackEvent(
        'ItinerarySettings',
        'ItineraryQuickSettingsSelection',
        name,
      );
    }
    const chosenMode = this.getQuickOptionSet()[name];
    replaceQueryParams(this.context.router, { ...chosenMode });
  };

  getModes = () => getModes(this.context.location, this.context.config);

  isModeSelected(mode) {
    return this.getModes().includes(mode.toUpperCase());
  }

  actions = {
    toggleBusState: () => this.toggleTransportMode('bus'),
    toggleTramState: () => this.toggleTransportMode('tram'),
    toggleRailState: () => this.toggleTransportMode('rail'),
    toggleSubwayState: () => this.toggleTransportMode('subway'),
    toggleFerryState: () => this.toggleTransportMode('ferry'),
    toggleCitybikeState: () => this.toggleTransportMode('citybike'),
    toggleAirplaneState: () => this.toggleTransportMode('airplane'),
  };

  toggleCustomizeSearchOffcanvas = () => {
    this.internalSetOffcanvas(!this.getOffcanvasState());
  };

  togglePopUp = () => {
    this.setState({ isPopUpOpen: !this.state.isPopUpOpen });
  };

  internalSetOffcanvas = newState => {
    /*
    if (this.context.piwik != null) {
      this.context.piwik.trackEvent(
        'ItinerarySettings',
        'ExtraSettingsPanelClick',
        newState ? 'ExtraSettingsPanelOpen' : 'ExtraSettingsPanelClose',
      );
    }
    */

    if (newState) {
      this.context.router.push({
        ...this.context.location,
        state: {
          ...this.context.location.state,
          customizeSearchOffcanvas: newState,
        },
      });
    } else {
      this.context.router.goBack();
    }
  };

  matchQuickOption = () => {
    const merged = {
      ...getDefaultSettings(this.context.config),
      ...getCustomizedSettings(),
      ...getQuerySettings(this.context.location.query),
    };
    delete merged.modes;

    // Find out which quick option the user has selected
    let currentOption = 'customized-mode';
    const quickOptions = this.getQuickOptionSet();

    Object.keys(quickOptions).forEach(key => {
      const quickSettings = { ...quickOptions[key] };
      const appliedSettings = pick(merged, Object.keys(quickSettings));
      if (isEqual(quickSettings, appliedSettings)) {
        currentOption = key;
      }
    });
    return currentOption;
  };

  toggleTransportMode(mode, otpMode) {
    if (
      isBikeRestricted(
        this.context.location,
        this.context.config,
        mode.toUpperCase(),
      )
    ) {
      this.togglePopUp();
      return;
    }
    const modes = xor(this.getModes(), [(otpMode || mode).toUpperCase()]).join(
      ',',
    );

    if (this.context.piwik != null) {
      this.context.piwik.trackEvent(
        'ItinerarySettings',
        'QuickSettingsTransportModeSelection',
        modes,
      );
    }

    this.context.router.replace({
      ...this.context.location,
      query: {
        ...this.context.location.query,
        modes,
      },
    });
  }

  render() {
    const arriveBy = get(this.context.location, 'query.arriveBy', 'false');
    const quickOption = this.matchQuickOption();
    const applicableQuickOptionSets = this.getApplicableQuickOptionSets();

    return (
      <div className={cx(['quicksettings-container'])}>
        <AlertPopUp
          isPopUpOpen={this.state.isPopUpOpen}
          textId="no-bike-allowed-popup"
          icon="caution"
          togglePopUp={this.togglePopUp}
        />
        <div className={cx('time-selector-settings-row')}>
          <TimeSelectorContainer
            startTime={this.props.timeSelectorStartTime}
            endTime={this.props.timeSelectorEndTime}
            serviceTimeRange={this.props.timeSelectorServiceTimeRange}
          />
          <div className="select-wrapper">
            <select
              className="arrive"
              value={arriveBy}
              onChange={this.setArriveBy}
            >
              <option value="false">
                {this.context.intl.formatMessage({
                  id: 'leaving-at',
                  defaultMessage: 'Leaving',
                })}
              </option>
              <option value="true">
                {this.context.intl.formatMessage({
                  id: 'arriving-at',
                  defaultMessage: 'Arriving',
                })}
              </option>
            </select>
            <Icon
              className="fake-select-arrow"
              img="icon-icon_arrow-dropdown"
            />
          </div>

          <div className="open-advanced-settings">
            <RightOffcanvasToggle
              onToggleClick={this.toggleCustomizeSearchOffcanvas}
              hasChanges={!this.props.hasDefaultPreferences}
            />
          </div>
        </div>
        <div className="bottom-row">
          <div className="toggle-modes">
            <ModeFilter
              action={this.actions}
              buttonClass="mode-icon"
              selectedModes={Object.keys(this.context.config.transportModes)
                .filter(
                  mode =>
                    this.context.config.transportModes[mode]
                      .availableForSelection,
                )
                .filter(mode => this.isModeSelected(mode))
                .map(mode => mode.toUpperCase())}
            />
          </div>
          <div className="select-wrapper">
            <select
              className="select-route-modes"
              value={quickOption}
              onChange={e => this.setQuickOption(e.target.value)}
            >
              <option value="fastest-route">
                {this.context.intl.formatMessage({
                  id: 'route-fastest',
                  defaultMessage: 'Fastest route',
                })}
              </option>
              {applicableQuickOptionSets.includes('least-transfers') && (
                <option value="least-transfers">
                  {this.context.intl.formatMessage({
                    id: 'route-least-transfers',
                    defaultMessage: 'Least transfers',
                  })}
                </option>
              )}
              {applicableQuickOptionSets.includes('least-walking') && (
                <option value="least-walking">
                  {this.context.intl.formatMessage({
                    id: 'route-least-walking',
                    defaultMessage: 'Least walking',
                  })}
                </option>
              )}
              {applicableQuickOptionSets.includes('prefer-walking-routes') && (
                <option value="prefer-walking-routes">
                  {this.context.intl.formatMessage({
                    id: 'route-prefer-walking-routes',
                    defaultMessage: 'Prefer walking routes',
                  })}
                </option>
              )}
              {applicableQuickOptionSets.includes('prefer-cycling-routes') && (
                <option value="prefer-cycling-routes">
                  {this.context.intl.formatMessage({
                    id: 'route-prefer-cycling-routes',
                    defaultMessage: 'Prefer cycling routes',
                  })}
                </option>
              )}
              {/* {applicableQuickOptionSets.includes(
                'public-transport-with-bicycle',
              ) && (
                <option value="public-transport-with-bicycle">
                  {this.context.intl.formatMessage({
                    id: 'route-with-bicycle',
                    defaultMessage: 'Public transport with bicycle',
                  })}
                </option>
              )} */}
              {quickOption === 'customized-mode' && (
                <option value="customized-mode">
                  {this.context.intl.formatMessage({
                    id: 'route-customized-mode',
                    defaultMessage: 'Customized mode',
                  })}
                </option>
              )}
            </select>
            <Icon
              className="fake-select-arrow"
              img="icon-icon_arrow-dropdown"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default QuickSettingsPanel;
