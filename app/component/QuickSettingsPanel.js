import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';
import get from 'lodash/get';
import xor from 'lodash/xor';
import { routerShape, locationShape } from 'react-router';

import AlertPopUp from './AlertPopUp';
import Icon from './Icon';
import ModeFilter from './ModeFilter';
import RightOffcanvasToggle from './RightOffcanvasToggle';
import TimeSelectorContainer from './TimeSelectorContainer';
import { QuickOptionSetType } from '../constants';
import { getModes, isBikeRestricted } from '../util/modeUtils';
import {
  matchQuickOption,
  getQuickOptionSets,
  getApplicableQuickOptionSets,
} from '../util/planParamUtil';
import { getCustomizedSettings } from '../store/localStorage';
import { replaceQueryParams, clearQueryParams } from '../util/queryUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class QuickSettingsPanel extends React.Component {
  static propTypes = {
    timeSelectorStartTime: PropTypes.number,
    timeSelectorEndTime: PropTypes.number,
    timeSelectorServiceTimeRange: PropTypes.object.isRequired,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  state = {
    isPopUpOpen: false,
  };

  actions = {
    toggleBusState: () => this.toggleTransportMode('bus'),
    toggleTramState: () => this.toggleTransportMode('tram'),
    toggleRailState: () => this.toggleTransportMode('rail'),
    toggleSubwayState: () => this.toggleTransportMode('subway'),
    toggleFerryState: () => this.toggleTransportMode('ferry'),
    toggleCitybikeState: () => this.toggleTransportMode('citybike'),
    toggleAirplaneState: () => this.toggleTransportMode('airplane'),
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
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'LeavingArrivingSelection',
      name: arriveBy === 'true' ? 'SelectArriving' : 'SelectLeaving',
    });
    replaceQueryParams(this.context.router, { arriveBy });
  };

  setQuickOption = name => {
    const { router } = this.context;

    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'ItineraryQuickSettingsSelection',
      name,
    });

    const quickOptionSet = getQuickOptionSets(this.context)[name];
    if (name === QuickOptionSetType.SavedSettings) {
      clearQueryParams(router, Object.keys(quickOptionSet));
    } else {
      replaceQueryParams(router, { ...quickOptionSet });
    }
  };

  getModes = () => getModes(this.context.location, this.context.config);

  toggleCustomizeSearchOffcanvas = () => {
    addAnalyticsEvent({
      action: 'OpenSettings',
      category: 'ItinerarySettings',
      name: null,
    });
    this.internalSetOffcanvas(!this.getOffcanvasState());
  };

  togglePopUp = () => {
    this.setState(({ isPopUpOpen }) => ({ isPopUpOpen: !isPopUpOpen }));
  };

  internalSetOffcanvas = newState => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'ExtraSettingsPanelClick',
      name: newState ? 'ExtraSettingsPanelOpen' : 'ExtraSettingsPanelClose',
    });

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

  isModeSelected(mode) {
    return this.getModes().includes(mode.toUpperCase());
  }

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

    const disable = this.getModes().includes(mode.toUpperCase());
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: disable
        ? 'QuickSettingsDisableTransportMode'
        : 'QuickSettingsEnableTransportMode',
      name: mode.toUpperCase(),
    });

    replaceQueryParams(this.context.router, { modes });
  }

  render() {
    const arriveBy = get(this.context.location, 'query.arriveBy', 'false');
    const customizedSettings = getCustomizedSettings();
    const quickOption = matchQuickOption(this.context);
    const applicableQuickOptionSets = getApplicableQuickOptionSets(
      this.context,
    );
    const modesWithNoBicycle = this.context.config.modesWithNoBike;

    return (
      <div className={cx(['quicksettings-container'])}>
        <AlertPopUp
          className="no-bike-allowed-popup"
          isPopUpOpen={this.state.isPopUpOpen}
          textId={
            Array.isArray(modesWithNoBicycle) &&
            modesWithNoBicycle.includes('RAIL')
              ? 'no-bike-allowed-popup-train'
              : 'no-bike-allowed-popup-tram-bus'
          }
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
              aria-label={this.context.intl.formatMessage({
                id: 'arrive-leave',
                defaultMessage: 'Arrive or leave at selected time',
              })}
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
              hasChanges={
                quickOption === 'saved-settings' ||
                quickOption === 'custom-settings'
              }
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
              <option value="default-route">
                {this.context.intl.formatMessage({
                  id: 'route-default',
                  defaultMessage: 'Default settings',
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
              {applicableQuickOptionSets.includes(
                'least-elevation-changes',
              ) && (
                <option value="least-elevation-changes">
                  {this.context.intl.formatMessage({
                    id: 'route-least-elevation-changes',
                    defaultMessage: 'Least elevation changes',
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
              {applicableQuickOptionSets.includes('prefer-greenways') && (
                <option value="prefer-greenways">
                  {this.context.intl.formatMessage({
                    id: 'route-prefer-greenways',
                    defaultMessage: 'Prefer cycling routes',
                  })}
                </option>
              )}
              {applicableQuickOptionSets.includes(
                'public-transport-with-bicycle',
              ) && (
                <option value="public-transport-with-bicycle">
                  {this.context.intl.formatMessage({
                    id: 'route-public-transport-with-bicycle',
                    defaultMessage: 'Public transport with bicycle',
                  })}
                </option>
              )}
              {customizedSettings &&
                Object.keys(customizedSettings).length > 0 &&
                applicableQuickOptionSets.includes('saved-settings') && (
                  <option value="saved-settings">
                    {this.context.intl.formatMessage({
                      id: 'route-saved-settings',
                      defaultMessage: 'Customized mode',
                    })}
                  </option>
                )}
              {quickOption === 'custom-settings' && (
                <option value="custom-settings">
                  {this.context.intl.formatMessage({
                    id: 'route-custom-settings',
                    defaultMessage: 'Current Settings',
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
