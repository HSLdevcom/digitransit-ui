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
import { defaultSettings } from './../util/planParamUtil';
import { getCustomizedSettings } from '../store/localStorage';
import { getModes } from '../util/modeUtils';

/* define what belongs to predefined 'quick' parameter selections */
const quickOptionParams = [
  'minTransferTime',
  'walkSpeed',
  'walkBoardCost',
  'walkReluctance',
  'transferPenalty',
];

const quickOptions = {
  'default-route': {
    ...defaultSettings,
  },
  'fastest-route': {
    ...defaultSettings,
    minTransferTime: 60,
    walkSpeed: 1.5,
    walkBoardCost: 540,
    walkReluctance: 1.5,
    transferPenalty: 0,
  },
  'least-transfers': {
    ...defaultSettings,
    walkBoardCost: 600,
    walkReluctance: 3,
    transferPenalty: 5460,
  },
  'least-walking': {
    ...defaultSettings,
    walkBoardCost: 360,
    walkReluctance: 5,
    transferPenalty: 0,
  },
};

class QuickSettingsPanel extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    hasDefaultPreferences: PropTypes.bool.isRequired,
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

  setQuickOption = name => {
    const chosenMode = quickOptions[name];
    this.context.router.replace({
      ...this.context.location,
      query: {
        ...this.context.location.query,
        minTransferTime: chosenMode.minTransferTime,
        walkSpeed: chosenMode.walkSpeed,
        walkBoardCost: chosenMode.walkBoardCost,
        walkReluctance: chosenMode.walkReluctance,
        transferPenalty: chosenMode.transferPenalty,
      },
    });
  };

  getModes = () => getModes(this.context.location, this.context.config);

  getMode(mode) {
    return this.getModes().includes(mode.toUpperCase());
  }

  matchQuickOption = () => {
    const merged = {
      ...quickOptions['default-route'],
      ...getCustomizedSettings(),
      ...this.context.location.query,
    };

    const match = (a, b) => {
      let equal = true;
      quickOptionParams.forEach(prm => {
        if (Number(a[prm]) !== Number(b[prm])) {
          equal = false;
        }
      });
      return equal;
    };

    // Find out which quick option the user has selected
    let currentOption = 'customized-mode';
    Object.keys(quickOptions).forEach(key => {
      if (match(merged, quickOptions[key])) {
        currentOption = key;
      }
    });
    return currentOption;
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

  render() {
    const arriveBy = get(this.context.location, 'query.arriveBy', 'false');
    const quickOption = this.matchQuickOption();

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
              value={quickOption}
              onChange={e => this.setQuickOption(e.target.value)}
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
