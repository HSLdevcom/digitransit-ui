import PropTypes from 'prop-types';
import React from 'react';
import get from 'lodash/get';
import { intlShape, FormattedMessage } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import range from 'lodash/range';
import xor from 'lodash/xor';
import without from 'lodash/without';
import cx from 'classnames';

import Icon from './Icon';
import Slider from './Slider';
import ToggleButton from './ToggleButton';
import ModeFilter from './ModeFilter';
import Select from './Select';
import FareZoneSelector from './FareZoneSelector';
import {
  getCustomizedSettings,
  resetCustomizedSettings,
} from '../store/localStorage';
import SaveCustomizedSettingsButton from './SaveCustomizedSettingsButton';
import ResetCustomizedSettingsButton from './ResetCustomizedSettingsButton';
import { getDefaultModes } from './../util/planParamUtil';

// find the array slot closest to a value
function mapToSlider(value, arr) {
  let best = 0;
  let minDiff = Math.abs(value - arr[0]);

  for (let i = 1; i < arr.length; i++) {
    const diff = Math.abs(value - arr[i]);
    if (diff < minDiff) {
      minDiff = diff;
      best = i;
    }
  }
  return best;
}

const WALKBOARDCOST_MIN = 1;
const WALKBOARDCOST_DEFAULT = 600;
const WALKBOARDCOST_MAX = 3600;

// Get default settings
export const defaultSettings = {
  accessibilityOption: 0,
  minTransferTime: 120,
  walkBoardCost: WALKBOARDCOST_DEFAULT,
  transferPenalty: 0,
  walkReluctance: 2,
  walkSpeed: 1.2,
  ticketTypes: null,
};

class CustomizeSearch extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    isOpen: PropTypes.bool,
    onToggleClick: PropTypes.func.isRequired,
  };

  static defaultProps = {
    isOpen: false,
  };

  /*
      This function is used to map our desired min, max, and default values to a standard
      amount of steps on the UI sliders. This allows us to always keep the default values
      in the slider midpoint.

      The ranges below and above the default value are divided into even steps, after which
      the two ranges are combined into a single array of desired values.
  */
  static getSliderStepsArray(min, max, defaultValue, stepCount = 20) {
    const denom = stepCount / 2;
    const lowStep = (defaultValue - min) / denom;
    const lowRange = range(min, defaultValue, lowStep);
    const highStep = (max - defaultValue) / denom;
    const highRange = range(defaultValue, max, highStep);
    const sliderSteps = lowRange.concat(highRange.concat(max));
    return sliderSteps;
  }

  componentWillMount() {
    this.walkReluctanceSliderValues = CustomizeSearch.getSliderStepsArray(
      0.8,
      10,
      2,
    ).reverse();

    this.walkBoardCostSliderValues = CustomizeSearch.getSliderStepsArray(
      WALKBOARDCOST_MIN,
      WALKBOARDCOST_MAX,
      WALKBOARDCOST_DEFAULT,
    )
      .reverse()
      .map(num => Math.round(num));

    this.transferMarginSliderValues = CustomizeSearch.getSliderStepsArray(
      60,
      720,
      120,
    ).map(num => Math.round(num));

    this.walkingSpeedSliderValues = CustomizeSearch.getSliderStepsArray(
      0.5,
      3,
      1.2,
    );
  }

  getStreetModesToggleButtons = () => {
    const availableStreetModes = Object.keys(
      this.context.config.streetModes,
    ).filter(
      streetMode =>
        this.context.config.streetModes[streetMode].availableForSelection,
    );

    if (!availableStreetModes.length) {
      return null;
    }

    return availableStreetModes.map((streetMode, index) => (
      <ToggleButton
        key={`toggle-button-${streetMode}`}
        icon={this.context.config.streetModes[streetMode].icon}
        onBtnClick={() => this.toggleStreetMode(streetMode)}
        state={this.getMode(streetMode)}
        checkedClass={streetMode}
        label={streetMode}
        className={cx('small-4', {
          'first-btn': index === 0,
          'last-btn': index === availableStreetModes.length - 1,
        })}
      />
    ));
  };

  getWalkReluctanceSlider = val => (
    <section className="offcanvas-section">
      <Slider
        headerText={this.context.intl.formatMessage({
          id: 'walking',
          defaultMessage: 'Walking',
        })}
        onSliderChange={e =>
          this.context.router.replace({
            queryToSend: {
              ...this.context.location,
              query: {
                ...this.context.location.query,
                walkReluctance: this.walkReluctanceSliderValues[e.target.value],
              },
            },
          })
        }
        min={0}
        max={20}
        value={mapToSlider(val, this.walkReluctanceSliderValues)}
        step={1}
        minText={this.context.intl.formatMessage({
          id: 'avoid-walking',
          defaultMessage: 'Avoid walking',
        })}
        maxText={this.context.intl.formatMessage({
          id: 'prefer-walking',
          defaultMessage: 'Prefer walking',
        })}
      />
    </section>
  );

  getWalkBoardCostSlider = val => (
    <section className="offcanvas-section">
      <Slider
        headerText={this.context.intl.formatMessage({
          id: 'transfers',
          defaultMessage: 'Transfers',
        })}
        onSliderChange={e =>
          this.context.router.replace({
            queryToSend: {
              ...this.context.location,
              query: {
                ...this.context.location.query,
                walkBoardCost: this.walkBoardCostSliderValues[e.target.value],
              },
            },
          })
        }
        min={0}
        max={20}
        value={mapToSlider(val, this.walkBoardCostSliderValues)}
        step={1}
        minText={this.context.intl.formatMessage({
          id: 'avoid-transfers',
          defaultMessage: 'Avoid transfers',
        })}
        maxText={this.context.intl.formatMessage({
          id: 'transfers-allowed',
          defaultMessage: 'Transfers allowed',
        })}
      />
    </section>
  );

  getTransferMarginSlider = val => (
    <section className="offcanvas-section">
      <Slider
        headerText={this.context.intl.formatMessage({
          id: 'transfers-margin',
          defaultMessage: 'Transfer margin at least',
        })}
        onSliderChange={e =>
          this.context.router.replace({
            queryToSend: {
              ...this.context.location,
              query: {
                ...this.context.location.query,
                minTransferTime: this.transferMarginSliderValues[
                  e.target.value
                ],
              },
            },
          })
        }
        min={0}
        max={20}
        writtenValue={`${Math.round(val / 60)} min`}
        value={mapToSlider(val, this.transferMarginSliderValues)}
        step={1}
        minText={this.context.intl.formatMessage({
          id: 'no-transfers-margin',
          defaultMessage: '1 min',
        })}
        maxText={this.context.intl.formatMessage({
          id: 'long-transfers-margin',
          defaultMessage: '12 min',
        })}
      />
    </section>
  );
  getWalkSpeedSlider = val => (
    <section className="offcanvas-section">
      <Slider
        headerText={this.context.intl.formatMessage({
          id: 'walking-speed',
          defaultMessage: 'Walking speed',
        })}
        onSliderChange={e =>
          this.context.router.replace({
            queryToSend: {
              ...this.context.location,
              query: {
                ...this.context.location.query,
                walkSpeed: this.walkingSpeedSliderValues[e.target.value],
              },
            },
          })
        }
        min={0}
        max={20}
        value={mapToSlider(val, this.walkingSpeedSliderValues)}
        step={1}
        writtenValue={`${Math.floor(val * 60)} m/min`}
        minText={this.context.intl.formatMessage({
          id: 'slow',
          defaultMessage: 'Slow',
        })}
        maxText={this.context.intl.formatMessage({
          id: 'run',
          defaultMessage: 'Run',
        })}
      />
    </section>
  );

  getTicketSelector = val => (
    <FareZoneSelector
      headerText={this.context.intl.formatMessage({
        id: 'zones',
        defaultMessage: 'Fare zones',
      })}
      options={get(this.context.config, 'fareMapping', {})}
      currentOption={val || 'none'}
      updateValue={newval =>
        this.context.router.replace({
          queryToSend: {
            ...this.context.location,
            query: {
              ...this.context.location.query,
              ticketTypes: newval,
            },
          },
        })
      }
    />
  );

  getAccessibilitySelector = val => (
    <section className="offcanvas-section">
      <Select
        headerText={this.context.intl.formatMessage({
          id: 'accessibility',
          defaultMessage: 'Accessibility',
        })}
        name="accessible"
        selected={val || 0}
        options={this.context.config.accessibilityOptions}
        onSelectChange={e =>
          this.context.router.replace({
            name: 'accessibilityOption',
            queryToSend: {
              ...this.context.location,
              query: {
                ...this.context.location.query,
                accessibilityOption: e.target.value,
              },
            },
          })
        }
      />
    </section>
  );

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

  resetParameters = () => {
    resetCustomizedSettings();
    this.context.router.replace({
      queryToSend: {
        ...this.context.location,
        query: {
          time: this.context.location.query.time,
          walkSpeed: defaultSettings.walkSpeed,
          walkReluctance: defaultSettings.walkReluctance,
          walkBoardCost: defaultSettings.walkBoardCost,
          minTransferTime: defaultSettings.minTransferTime,
          accessibilityOption: defaultSettings.accessibilityOption,
          modes: getDefaultModes(this.context.config).toString(),
          ticketTypes: defaultSettings.ticketTypes,
        },
      },
    });
  };

  toggleTransportMode(mode, otpMode) {
    this.context.router.replace({
      name: 'modes',
      queryToSend: {
        ...this.context.location,
        query: {
          ...this.context.location.query,
          modes: xor(this.getModes(), [(otpMode || mode).toUpperCase()]).join(
            ',',
          ),
        },
      },
    });
  }

  toggleStreetMode(mode) {
    this.context.router.replace({
      name: 'modes',
      queryToSend: {
        ...this.context.location,
        query: {
          ...this.context.location.query,
          modes: without(
            this.getModes(),
            ...Object.keys(this.context.config.streetModes).map(m =>
              m.toUpperCase(),
            ),
          )
            .concat(mode.toUpperCase())
            .join(','),
        },
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

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    const { config } = this.context;
    // compose current settings
    const merged = {
      ...defaultSettings,
      ...getCustomizedSettings(),
      ...this.context.location.query,
    };
    return (
      <div
        aria-hidden={!this.props.isOpen}
        className="customize-search-wrapper"
        // Clicks to the transparent area and close arrow should close the offcanvas
        onClick={this.props.onToggleClick}
      >
        <div className="offcanvas-close">
          <div className="action-arrow" key="arrow">
            <Icon img="icon-icon_arrow-collapse--right" />
          </div>
        </div>
        <div
          className="customize-search"
          // Clicks musn't bubble to prevent wrapper from closing the offcanvas
          onClick={e => e.stopPropagation()}
        >
          <section className="offcanvas-section">
            <h4>
              <FormattedMessage
                id="main-mode"
                defaultMessage="I'm travelling by"
              />
            </h4>
            <div className="row btn-bar">
              {this.getStreetModesToggleButtons()}
            </div>
          </section>

          {config.customizeSearch.walkReluctance.available
            ? this.getWalkReluctanceSlider(merged.walkReluctance)
            : null}
          {config.customizeSearch.walkingSpeed.available
            ? this.getWalkSpeedSlider(merged.walkSpeed)
            : null}

          <section className="offcanvas-section">
            <hr />
          </section>

          <section className="offcanvas-section">
            <h4>
              <FormattedMessage
                id="using-modes"
                defaultMessage="I want to travel by"
              />
            </h4>
            <ModeFilter
              action={this.actions}
              buttonClass="mode-icon"
              selectedModes={Object.keys(config.transportModes)
                .filter(
                  mode => config.transportModes[mode].availableForSelection,
                )
                .filter(mode => this.getMode(mode))
                .map(mode => mode.toUpperCase())}
            />
          </section>

          {config.customizeSearch.walkBoardCost.available
            ? this.getWalkBoardCostSlider(merged.walkBoardCost)
            : null}
          {config.customizeSearch.transferMargin.available
            ? this.getTransferMarginSlider(merged.transferMargin)
            : null}
          {config.customizeSearch.ticketOptions.available
            ? this.getTicketSelector(merged.ticketTypes)
            : null}
          {config.customizeSearch.accessibility.available
            ? this.getAccessibilitySelector(merged.accessibilityOption)
            : null}
          <SaveCustomizedSettingsButton />
          <ResetCustomizedSettingsButton onReset={this.resetParameters} />
        </div>
      </div>
    );
  }
}

export default CustomizeSearch;
