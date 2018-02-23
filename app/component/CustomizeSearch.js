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
    executeAction: PropTypes.func.isRequired,
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

  /* eslint-disable react/no-unused-state */
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    // compose current settings
    const merged = {
      ...defaultSettings,
      ...getCustomizedSettings(),
      ...this.context.location.query,
    };

    this.walkReluctanceSliderValues = CustomizeSearch.getSliderStepsArray(
      0.8,
      10,
      2,
    ).reverse();

    this.walkReluctanceInitVal = mapToSlider(
      merged.walkReluctance,
      this.walkReluctanceSliderValues,
    );

    this.walkBoardCostSliderValues = CustomizeSearch.getSliderStepsArray(
      WALKBOARDCOST_MIN,
      WALKBOARDCOST_MAX,
      WALKBOARDCOST_DEFAULT,
    )
      .reverse()
      .map(num => Math.round(num));

    this.walkBoardCostInitVal = mapToSlider(
      merged.walkBoardCost,
      this.walkBoardCostSliderValues,
    );

    this.transferMarginSliderValues = CustomizeSearch.getSliderStepsArray(
      60,
      720,
      120,
    ).map(num => Math.round(num));
    this.transferMarginInitVal = mapToSlider(
      merged.minTransferTime,
      this.transferMarginSliderValues,
    );

    this.walkingSpeedSliderValues = CustomizeSearch.getSliderStepsArray(
      0.5,
      3,
      1.2,
    );
    this.walkingSpeedInitVal = mapToSlider(
      merged.walkSpeed,
      this.walkingSpeedSliderValues,
    );

    // Set the states accordingly to send as Slider values
    this.setState({
      minTransferTime: this.transferMarginInitVal,
      walkBoardCost: this.walkBoardCostInitVal,
      walkReluctance: this.walkReluctanceInitVal,
      walkSpeed: this.walkingSpeedInitVal,
    });
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

  getWalkReluctanceSlider = () => (
    <section className="offcanvas-section">
      <Slider
        headerText={this.context.intl.formatMessage({
          id: 'walking',
          defaultMessage: 'Walking',
        })}
        onSliderChange={e =>
          this.updateSettings({
            sliderValues: this.walkReluctanceSliderValues,
            name: 'walkReluctance',
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
        value={this.state.walkReluctance}
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

  getWalkBoardCostSlider = () => (
    <section className="offcanvas-section">
      <Slider
        headerText={this.context.intl.formatMessage({
          id: 'transfers',
          defaultMessage: 'Transfers',
        })}
        onSliderChange={e =>
          this.updateSettings({
            sliderValues: this.walkBoardCostSliderValues,
            name: 'walkBoardCost',
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
        value={this.state.walkBoardCost}
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

  getTransferMarginSlider = () => (
    <section className="offcanvas-section">
      <Slider
        headerText={this.context.intl.formatMessage({
          id: 'transfers-margin',
          defaultMessage: 'Transfer margin at least',
        })}
        onSliderChange={e =>
          this.updateSettings({
            name: 'minTransferTime',
            sliderValues: this.transferMarginSliderValues,
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
        writtenValue={
          this.context.location.query.minTransferTime !== undefined
            ? `${Math.round(
                this.context.location.query.minTransferTime / 60,
              )} min`
            : `${2} min`
        }
        value={this.state.minTransferTime}
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
  getWalkSpeedSlider = () => (
    <section className="offcanvas-section">
      <Slider
        headerText={this.context.intl.formatMessage({
          id: 'walking-speed',
          defaultMessage: 'Walking speed',
        })}
        onSliderChange={e =>
          this.updateSettings({
            name: 'walkSpeed',
            sliderValues: this.walkingSpeedSliderValues,
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
        value={this.state.walkSpeed}
        step={1}
        writtenValue={
          this.context.location.query.walkSpeed !== undefined
            ? `${Math.floor(this.context.location.query.walkSpeed * 60)} m/min`
            : `${72} m/min`
        }
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

  getTicketType = () => {
    let ticketType;
    if (
      typeof this.context.location.query.ticketTypes !== 'undefined' &&
      this.context.location.query.ticketTypes !== null
    ) {
      ticketType = this.context.location.query.ticketTypes;
    } else if (!(typeof getCustomizedSettings().ticketTypes === 'undefined')) {
      ticketType = getCustomizedSettings().ticketTypes;
    } else {
      ticketType = 'none';
    }
    return ticketType;
  };

  getTicketSelector = () => (
    <FareZoneSelector
      headerText={this.context.intl.formatMessage({
        id: 'zones',
        defaultMessage: 'Fare zones',
      })}
      options={get(this.context.config, 'fareMapping', {})}
      currentOption={this.getTicketType()}
      updateValue={val =>
        this.updateSettings({
          queryToSend: {
            ...this.context.location,
            query: {
              ...this.context.location.query,
              ticketTypes: val,
            },
          },
        })
      }
    />
  );

  getAccessibilityOption = () => {
    let accessibilityOption;
    if (
      !(typeof this.context.location.query.accessibilityOption === 'undefined')
    ) {
      ({ accessibilityOption } = this.context.location.query);
    } else if (
      !(typeof getCustomizedSettings().accessibilityOption === 'undefined')
    ) {
      ({ accessibilityOption } = getCustomizedSettings());
    } else {
      accessibilityOption = 0;
    }
    return accessibilityOption;
  };

  getAccessibilitySelector = () => (
    <section className="offcanvas-section">
      <Select
        headerText={this.context.intl.formatMessage({
          id: 'accessibility',
          defaultMessage: 'Accessibility',
        })}
        name="accessible"
        selected={this.getAccessibilityOption()}
        options={this.context.config.accessibilityOptions}
        onSelectChange={e =>
          this.updateSettings({
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

  removeViaPoint = () => {
    this.updateSettings({
      queryToSend: {
        ...this.context.location,
        query: without(this.context.location, 'query.intermediatePlaces'),
      },
    });
  };

  updateSettings(val) {
    const prepareQuery = Object.assign(val.queryToSend);
    this.context.router.replace(prepareQuery);
    if (val.sliderValues) {
      this.setState({
        [val.name]:
          val.queryToSend.query[val.name] &&
          mapToSlider(val.queryToSend.query[val.name], val.sliderValues),
      });
    } else {
      this.setState({
        [val.name]: val.queryToSend.query[val.name],
      });
    }
  }

  resetParameters = () => {
    resetCustomizedSettings();
    this.setState({
      walkSpeed: mapToSlider(
        defaultSettings.walkSpeed,
        this.walkingSpeedSliderValues,
      ),
      walkReluctance: mapToSlider(
        defaultSettings.walkReluctance,
        this.walkReluctanceSliderValues,
      ),
      walkBoardCost: mapToSlider(
        defaultSettings.walkBoardCost,
        this.walkBoardCostSliderValues,
      ),
      accessibilityOption: defaultSettings.accessibilityOption,
      ticketTypes: defaultSettings.ticketTypes,
      minTransferTime: mapToSlider(
        defaultSettings.minTransferTime,
        this.transferMarginSliderValues,
      ),
    });
    this.updateSettings({
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
    this.updateSettings({
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
    this.updateSettings({
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
            ? this.getWalkReluctanceSlider()
            : null}
          {config.customizeSearch.walkingSpeed.available
            ? this.getWalkSpeedSlider()
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
            ? this.getWalkBoardCostSlider()
            : null}
          {config.customizeSearch.transferMargin.available
            ? this.getTransferMarginSlider()
            : null}
          {config.customizeSearch.ticketOptions.available
            ? this.getTicketSelector()
            : null}
          {config.customizeSearch.accessibility.available
            ? this.getAccessibilitySelector()
            : null}
          <SaveCustomizedSettingsButton />
          <ResetCustomizedSettingsButton onReset={this.resetParameters} />
        </div>
      </div>
    );
  }
}

export default CustomizeSearch;
