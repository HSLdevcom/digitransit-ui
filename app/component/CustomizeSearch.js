import React from 'react';
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
import { route } from '../action/ItinerarySearchActions';

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

class CustomizeSearch extends React.Component {

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    config: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    isOpen: React.PropTypes.bool,
    onToggleClick: React.PropTypes.func,
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

  getDefaultModes = () =>
    [
      ...Object.keys(this.context.config.transportModes)
        .filter(mode => this.context.config.transportModes[mode].defaultValue)
        .map(mode => mode.toUpperCase()),
      ...Object.keys(this.context.config.streetModes)
        .filter(mode => this.context.config.streetModes[mode].defaultValue)
        .map(mode => mode.toUpperCase()),
    ]

  getStreetModesToggleButtons = () => {
    const availableStreetModes = Object.keys(this.context.config.streetModes)
      .filter(streetMode => this.context.config.streetModes[streetMode].availableForSelection);

    if (!availableStreetModes.length) return null;

    return availableStreetModes.map((streetMode, index) => (
      <ToggleButton
        key={`toggle-button-${streetMode}`}
        icon={this.context.config.streetModes[streetMode].icon}
        onBtnClick={() => this.toggleStreetMode(streetMode)}
        state={this.getMode(streetMode)}
        checkedClass={streetMode}
        className={cx('small-4',
          { 'first-btn': index === 0, 'last-btn': index === availableStreetModes.length - 1 },
        )}
      />
    ));
  }

  getWalkReluctanceSlider = () => {
    const walkReluctanceSliderValues =
          CustomizeSearch.getSliderStepsArray(0.8, 10, 2).reverse();
    const initVal = this.context.location.query.walkReluctance ?
          mapToSlider(this.context.location.query.walkReluctance, walkReluctanceSliderValues) :
          10;

    return (<section className="offcanvas-section">
      <Slider
        headerText={this.context.intl.formatMessage({
          id: 'walking',
          defaultMessage: 'Walking',
        })}
        onSliderChange={e => this.updateSettings(
          'walkReluctance',
          walkReluctanceSliderValues[e.target.value],
        )}
        min={0}
        max={20}
        defaultValue={initVal}
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
    </section>);
  }

  getWalkBoardCostSlider = () => {
    const walkBoardCostSliderValues =
      CustomizeSearch.getSliderStepsArray(1, 1800, 600).reverse().map(num => Math.round(num));
    const initVal = this.context.location.query.walkBoardCost ?
          mapToSlider(this.context.location.query.walkBoardCost, walkBoardCostSliderValues) :
          10;

    return (
      <section className="offcanvas-section">
        <Slider
          headerText={this.context.intl.formatMessage({
            id: 'transfers',
            defaultMessage: 'Transfers',
          })}
          onSliderChange={e => this.updateSettings(
            'walkBoardCost',
            walkBoardCostSliderValues[e.target.value],
          )}
          min={0}
          max={20}
          defaultValue={initVal}
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
      </section>);
  }

  getTransferMarginSlider = () => {
    const transferMarginSliderValues =
          CustomizeSearch.getSliderStepsArray(60, 660, 180).map(num => Math.round(num));
    const initVal = this.context.location.query.minTransferTime ?
          mapToSlider(this.context.location.query.minTransferTime, transferMarginSliderValues) :
          10;

    return (
      <section className="offcanvas-section">
        <Slider
          headerText={this.context.intl.formatMessage({
            id: 'transfers-margin',
            defaultMessage: 'Transfer margin',
          })}
          onSliderChange={e => this.updateSettings(
            'minTransferTime',
            transferMarginSliderValues[e.target.value],
          )}
          min={0}
          max={20}
          defaultValue={initVal}
          step={1}
          minText={this.context.intl.formatMessage({
            id: 'no-transfers-margin',
            defaultMessage: 'None',
          })}
          maxText={this.context.intl.formatMessage({
            id: 'long-transfers-margin',
            defaultMessage: 'Very long',
          })}
        />
      </section>);
  }

  getWalkSpeedSlider = () => {
    const walkingSpeedSliderValues = CustomizeSearch.getSliderStepsArray(0.5, 3, 1.2);
    const initVal = this.context.location.query.walkSpeed ?
          mapToSlider(this.context.location.query.walkSpeed, walkingSpeedSliderValues) :
          10;

    return (
      <section className="offcanvas-section">
        <Slider
          headerText={this.context.intl.formatMessage({
            id: 'walking-speed',
            defaultMessage: 'Walking speed',
          })}
          onSliderChange={e => this.updateSettings(
            'walkSpeed',
            walkingSpeedSliderValues[e.target.value],
          )}
          min={0}
          max={20}
          defaultValue={initVal}
          step={1}
          minText={this.context.intl.formatMessage({
            id: 'slow',
            defaultMessage: 'Slow',
          })}
          maxText={this.context.intl.formatMessage({
            id: 'run',
            defaultMessage: 'Run',
          })}
        />
      </section>);
  }

  getTicketSelector = () => (
    <section className="offcanvas-section">
      <Select
        headerText={this.context.intl.formatMessage({
          id: 'zones',
          defaultMessage: 'Zones',
        })}
        name="ticket"
        selected={this.context.location.query.ticketOption || '0'}
        options={this.context.config.ticketOptions}
        onSelectChange={e => this.updateSettings(
          'ticketOption',
          e.target.value,
        )}
      />
    </section>);

  getAccessibilitySelector = () => (
    <section className="offcanvas-section">
      <Select
        headerText={this.context.intl.formatMessage({
          id: 'accessibility',
          defaultMessage: 'Accessibility',
        })}
        name="accessible"
        selected={this.context.location.query.accessibilityOption || '0'}
        options={this.context.config.accessibilityOptions}
        onSelectChange={e => this.updateSettings(
          'accessibilityOption',
          e.target.value,
        )}
      />
    </section>);

  getModes() {
    if (this.context.location.query.modes) {
      return decodeURI(this.context.location.query.modes).split(',');
    }
    return this.getDefaultModes();
  }

  getMode(mode) {
    return this.getModes().includes(mode.toUpperCase());
  }

  updateSettings(name, value) {
    this.context.executeAction(
      route,
      {
        location: {
          ...this.context.location,
          query: {
            ...this.context.location.query,
            [name]: value,
          },
        },
        router: this.context.router,
      },
    );
  }

  toggleTransportMode(mode, otpMode) {
    this.context.executeAction(
      route,
      {
        location: {
          ...this.context.location,
          query: {
            ...this.context.location.query,
            modes: xor(this.getModes(), [(otpMode || mode).toUpperCase()]).join(','),
          },
        },
        router: this.context.router,
      },
    );
  }

  toggleStreetMode(mode) {
    this.context.executeAction(
      route,
      {
        location: {
          ...this.context.location,
          query: {
            ...this.context.location.query,
            modes:
              without(
                this.getModes(),
                ...Object.keys(this.context.config.streetModes).map(m => m.toUpperCase()))
              .concat(mode.toUpperCase())
              .join(','),
          },
        },
        router: this.context.router,
      },
    );
  }

  actions = {
    toggleBusState: () => this.toggleTransportMode('bus'),
    toggleTramState: () => this.toggleTransportMode('tram'),
    toggleRailState: () => this.toggleTransportMode('rail'),
    toggleSubwayState: () => this.toggleTransportMode('subway'),
    toggleFerryState: () => this.toggleTransportMode('ferry'),
    toggleCitybikeState: () => this.toggleTransportMode('citybike'),
    toggleAirplaneState: () => this.toggleTransportMode('airplane'),
  }

  render() {
    const config = this.context.config;
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
            <h4><FormattedMessage id="main-mode" defaultMessage="I'm travelling by" /></h4>
            <div className="row btn-bar">
              {this.getStreetModesToggleButtons()}
            </div>
          </section>

          {config.customizeSearch.walkReluctance.available ? this.getWalkReluctanceSlider() : null}
          {config.customizeSearch.walkingSpeed.available ? this.getWalkSpeedSlider() : null}

          <section className="offcanvas-section">
            <hr />
          </section>

          <section className="offcanvas-section">
            <h4><FormattedMessage id="using-modes" defaultMessage="Using" /></h4>
            <ModeFilter
              action={this.actions}
              buttonClass="mode-icon"
              selectedModes={
                Object.keys(config.transportModes)
                  .filter(mode => config.transportModes[mode].availableForSelection)
                  .filter(mode => this.getMode(mode))
                  .map(mode => mode.toUpperCase())
              }
            />
          </section>

          {config.customizeSearch.walkBoardCost.available ? this.getWalkBoardCostSlider() : null}
          {config.customizeSearch.transferMargin.available ? this.getTransferMarginSlider() : null}
          {config.customizeSearch.ticketOptions.available ? this.getTicketSelector() : null}
          {config.customizeSearch.accessibility.available ? this.getAccessibilitySelector() : null}
        </div>
      </div>);
  }
}

export default CustomizeSearch;
