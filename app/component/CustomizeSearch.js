import PropTypes from 'prop-types';
import React from 'react';
import get from 'lodash/get';
import { intlShape, FormattedMessage } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import range from 'lodash/range';
import xor from 'lodash/xor';
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
import {
  defaultSettings,
  WALKBOARDCOST_DEFAULT,
} from './../util/planParamUtil';
import * as ModeUtils from '../util/modeUtils';

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
const WALKBOARDCOST_MAX = 3600;

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

    const { config } = this.context;
    this.availableStreetModes = ModeUtils.getAvailableStreetModeConfigs(config);
    this.availableTransportModes = ModeUtils.getAvailableTransportModeConfigs(
      config,
    );
  }

  getStreetModesToggleButtons = () => {
    if (!this.availableStreetModes.length) {
      return null;
    }

    const { config, router } = this.context;
    return this.availableStreetModes.map(({ exclusive, icon, name }, index) => {
      const lowerCaseName = name.toLowerCase();
      return (
        <ToggleButton
          checkedClass={lowerCaseName}
          key={`toggle-button-${lowerCaseName}`}
          icon={icon}
          onBtnClick={() =>
            ModeUtils.setStreetMode(name, config, router, exclusive)
          }
          state={this.getMode(name)}
          label={`street-mode-${lowerCaseName}`}
          className={cx('small-4', {
            'first-btn': index === 0,
            'last-btn': index === this.availableStreetModes.length - 1,
          })}
        />
      );
    });
  };

  getWalkReluctanceSlider = val => (
    <section className="offcanvas-section">
      <Slider
        headerText={this.context.intl.formatMessage({
          id: 'walking',
          defaultMessage: 'Walking',
        })}
        onSliderChange={e =>
          this.replaceParams({
            walkReluctance: this.walkReluctanceSliderValues[e.target.value],
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
          this.replaceParams({
            walkBoardCost: this.walkBoardCostSliderValues[e.target.value],
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
          this.replaceParams({
            minTransferTime: this.transferMarginSliderValues[e.target.value],
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
          this.replaceParams({
            walkSpeed: this.walkingSpeedSliderValues[e.target.value],
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
      updateValue={newval => this.replaceParams({ ticketTypes: newval })}
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
        selected={val || this.context.config.accessibilityOptions[0].value}
        options={this.context.config.accessibilityOptions.map((o, i) => ({
          displayNameObject: (
            <FormattedMessage
              defaultMessage={
                this.context.config.accessibilityOptions[i].displayName
              }
              id={this.context.config.accessibilityOptions[i].messageId}
            />
          ),
          displayName: this.context.config.accessibilityOptions[i].displayName,
          value: this.context.config.accessibilityOptions[i].value,
        }))}
        onSelectChange={e =>
          this.replaceParams({ accessibilityOption: e.target.value })
        }
      />
    </section>
  );

  getModes() {
    const { location, config } = this.context;
    return ModeUtils.getModes(location, config);
  }

  getMode(mode) {
    return this.getModes().includes(mode.toUpperCase());
  }

  replaceParams = newParams =>
    this.context.router.replace({
      ...this.context.location,
      query: {
        ...this.context.location.query,
        ...newParams,
      },
    });

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
    this.replaceParams({
      modes: xor(this.getModes(), [(otpMode || mode).toUpperCase()]).join(','),
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
              selectedModes={this.availableTransportModes
                .filter(mode => this.getMode(mode.name))
                .map(mode => mode.name.toUpperCase())}
            />
          </section>

          {config.customizeSearch.walkBoardCost.available
            ? this.getWalkBoardCostSlider(merged.walkBoardCost)
            : null}
          {config.customizeSearch.transferMargin.available
            ? this.getTransferMarginSlider(merged.minTransferTime)
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
