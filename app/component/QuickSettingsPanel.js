import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';
import xor from 'lodash/xor';
import { routerShape, locationShape } from 'react-router';
import get from 'lodash/get';
import Icon from './Icon';
import ModeFilter from './ModeFilter';
import RightOffcanvasToggle from './RightOffcanvasToggle';
import { getDefaultModes } from './../util/planParamUtil';
import { getCustomizedSettings } from '../store/localStorage';

class QuickSettingsPanel extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    hasDefaultPreferences: PropTypes.bool.isRequired,
    optimizedRouteParams: PropTypes.func.isRequired,
  };
  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    piwik: PropTypes.object,
    config: PropTypes.object.isRequired,
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
    this.context.router.replace({
      pathname: this.context.location.pathname,
      query: {
        ...this.context.location.query,
        arriveBy,
      },
    });
  };

  setRouteMode = values => {
    const chosenMode = this.optimizedRouteModes().filter(
      o => Object.keys(o)[0] === values,
    )[0][values];
    chosenMode.optimizedRoute = true;
    this.props.optimizedRouteParams(chosenMode);

    this.context.router.replace({
      ...this.context.location,
      query: {
        ...this.defaultOptions(),
        walkBoardCost: chosenMode.walkBoardCost,
        walkReluctance: chosenMode.walkReluctance,
        transferPenalty: chosenMode.transferPenalty,
        modes:
          this.context.location.query.modes ||
          getDefaultModes(this.context.config).toString(),
        ticketTypes: this.context.location.query.ticketTypes || null,
        accessibilityOption:
          this.context.location.query.accessibilityOption || 0,
        arriveBy: this.context.location.query.arriveBy,
      },
    });
  };

  getRouteParamsFromUrl = () =>
    this.checkModeParams({
      minTransferTime: Number(
        get(this.context.location, 'query.minTransferTime'),
      ),
      walkSpeed: Number(get(this.context.location, 'query.walkSpeed')),
      walkBoardCost: Number(get(this.context.location, 'query.walkBoardCost')),
      walkReluctance: Number(
        get(this.context.location, 'query.walkReluctance'),
      ),
      transferPenalty: Number(
        get(this.context.location, 'query.transferPenalty'),
      ),
    });

  getRouteParamsFromSavedSettings = savedSettings =>
    this.checkModeParams({
      minTransferTime: Number(savedSettings.minTransferTime),
      walkSpeed: Number(savedSettings.walkSpeed),
      walkBoardCost: Number(savedSettings.walkBoardCost),
      walkReluctance: Number(savedSettings.walkReluctance),
      transferPenalty: Number(savedSettings.transferPenalty),
    });

  getSetSettings = () => {
    const savedSettings = getCustomizedSettings();
    const isUrlEmpty =
      this.context.location.query &&
      Object.keys(this.context.location.query).map(
        o => this.context.location.query[o],
      ).length === 0;
    if (!isUrlEmpty) {
      return this.getRouteParamsFromUrl();
    }
    return this.getRouteParamsFromSavedSettings(savedSettings);
  };

  getModes() {
    if (this.context.location.query.modes) {
      return decodeURI(this.context.location.query.modes)
        .split('?')[0]
        .split(',');
    } else if (getCustomizedSettings().modes) {
      return getCustomizedSettings().modes;
    }
    return getDefaultModes(this.context.config);
  }

  getMode(mode) {
    return this.getModes().includes(mode.toUpperCase());
  }

  checkModeParams = val => {
    const optimizedRoutes = this.optimizedRouteModes();
    // Find out which mode the user has selected by
    const currentMode = optimizedRoutes
      .map(o => {
        const firstKey = Object.keys(o)[0];
        if (JSON.stringify(o[firstKey]) === JSON.stringify(val)) {
          return firstKey;
        }
        return undefined;
      })
      // Clean out the undefined non-matches and pick the remaining result
      .filter(o => o)[0];

    return currentMode || 'customized-mode';
  };

  toggleTransportMode(mode, otpMode) {
    this.context.router.replace({
      ...this.context.location,
      query: {
        ...this.context.location.query,
        modes: xor(this.getModes(), [(otpMode || mode).toUpperCase()]).join(
          ',',
        ),
      },
    });
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

  defaultOptions = () => ({
    minTransferTime: 120,
    walkSpeed: 1.2,
  });

  defaultRoute = () => ({
    ...this.defaultOptions(),
    walkBoardCost: 600,
    walkReluctance: 2,
    transferPenalty: 0,
  });

  toggleCustomizeSearchOffcanvas = () => {
    this.internalSetOffcanvas(!this.getOffcanvasState());
  };

  internalSetOffcanvas = newState => {
    if (this.context.piwik != null) {
      this.context.piwik.trackEvent(
        'Offcanvas',
        'Customize Search',
        newState ? 'close' : 'open',
      );
    }

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

  optimizedRouteModes = () => [
    {
      'default-route': this.defaultRoute(),
    },
    {
      'fastest-route': {
        ...this.defaultOptions(),
        walkBoardCost: 540,
        walkReluctance: 1.5,
        transferPenalty: 0,
      },
    },
    {
      'least-transfers': {
        ...this.defaultOptions(),
        walkBoardCost: 600,
        walkReluctance: 3,
        transferPenalty: 5460,
      },
    },
    {
      'least-walking': {
        ...this.defaultOptions(),
        walkBoardCost: 360,
        walkReluctance: 5,
        transferPenalty: 0,
      },
    },
  ];

  render() {
    const arriveBy = get(this.context.location, 'query.arriveBy', 'false');
    const getRoute = this.getSetSettings();

    return (
      <div
        className={cx([
          'quicksettings-container',
          {
            visible: this.props.visible,
          },
        ])}
      >
        <div className="top-row">
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
          <div className="select-wrapper">
            <select
              className="select-route-modes"
              value={getRoute}
              onChange={e => this.setRouteMode(e.target.value)}
            >
              <option value="default-route">
                {this.context.intl.formatMessage({
                  id: 'route-default',
                  defaultMessage: 'Default route',
                })}
              </option>
              <option value="fastest-route">
                {this.context.intl.formatMessage({
                  id: 'route-fastest',
                  defaultMessage: 'Fastest route',
                })}
              </option>
              <option value="least-transfers">
                {this.context.intl.formatMessage({
                  id: 'route-least-transfers',
                  defaultMessage: 'Least transfers',
                })}
              </option>
              <option value="least-walking">
                {this.context.intl.formatMessage({
                  id: 'route-least-walking',
                  defaultMessage: 'Least walking',
                })}
              </option>
              {getRoute === 'customized-mode' && (
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
                .filter(mode => this.getMode(mode))
                .map(mode => mode.toUpperCase())}
            />
          </div>
          <div className="open-advanced-settings">
            <RightOffcanvasToggle
              onToggleClick={this.toggleCustomizeSearchOffcanvas}
              hasChanges={!this.props.hasDefaultPreferences}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default QuickSettingsPanel;
