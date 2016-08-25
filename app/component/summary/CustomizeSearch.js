import React from 'react';
import Slider from '../util/Slider';
import ToggleButton from '../util/ToggleButton';
import ModeFilter from '../util/ModeFilter';
import * as ItinerarySearchActions from '../../action/ItinerarySearchActions';
import Select from '../util/select';
import config from '../../config';
import { intlShape } from 'react-intl';
import range from 'lodash/range';

class CustomizeSearch extends React.Component {

  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    open: React.PropTypes.bool,
  };

  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    return this.context.getStore('ItinerarySearchStore').addChangeListener(this.onChange);
  }

  componentWillUnmount() {
    return this.context.getStore('ItinerarySearchStore').removeChangeListener(this.onChange);
  }

  onChange() {
    return this.forceUpdate();
  }

  getTicketOptions() {
    const options = this.context.getStore('ItinerarySearchStore').getTicketOptions();

    return options.map(
      (option, index) => <option key={index} value={option.value}>{option.displayName}</option>
    );
  }

  /*
      This function is used to map our desired min, max, and default values to a standard
      amount of steps on the UI sliders. This allows us to always keep the default values
      in the slider midpoint.

      The ranges below and above the default value are divided into even steps, after which
      the two ranges are combined into a single array of desired values.
  */
  getSliderStepsArray(min, max, defaultValue, stepCount = 20) {
    const denom = stepCount / 2;
    const lowStep = (defaultValue - min) / denom;
    const lowRange = range(min, defaultValue, lowStep);
    const highStep = (max - defaultValue) / denom;
    const highRange = range(defaultValue, max, highStep);
    const sliderSteps = lowRange.concat(highRange.concat(max));
    return sliderSteps;
  }

  getWalkReluctanceSlider = () => {
    // TODO: connect to this.context.getStore('ItinerarySearchStore').getWalkReluctance()

    const walkReluctanceSliderValues = this.getSliderStepsArray(0.8, 10, 2).reverse();

    return (<section className="offcanvas-section">
      <Slider
        headerText={this.context.intl.formatMessage({
          id: 'walking',
          defaultMessage: 'Walking',
        })}
        defaultValue={10}
        onSliderChange={e =>
          this.context.executeAction(
            ItinerarySearchActions.setWalkReluctance, walkReluctanceSliderValues[e.target.value])}
        min={0}
        max={20}
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
    // TODO: connect to this.context.getStore('ItinerarySearchStore').getWalkBoardCost()

    const walkBoardCostSliderValues = this.getSliderStepsArray(1, 1800, 600).reverse().map(
      num => Math.round(num));

    return (
      <section className="offcanvas-section">
        <Slider
          headerText={this.context.intl.formatMessage({
            id: 'transfers',
            defaultMessage: 'Transfers',
          })}
          defaultValue={10}
          onSliderChange={e => {
            this.context.executeAction(
              ItinerarySearchActions.setWalkBoardCost, walkBoardCostSliderValues[e.target.value]);
          }}
          min={0}
          max={20}
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
    // TODO: connect to this.context.getStore('ItinerarySearchStore').getMinTransferTime()

    const transferMarginSliderValues = this.getSliderStepsArray(60, 660, 180).map(
      num => Math.round(num));

    return (
      <section className="offcanvas-section">
        <Slider
          headerText={this.context.intl.formatMessage({
            id: 'transfers-margin',
            defaultMessage: 'Transfer margin',
          })}
          defaultValue={10}
          onSliderChange={e => {
            this.context.executeAction(
              ItinerarySearchActions.setMinTransferTime,
              transferMarginSliderValues[e.target.value]
            );
          }}
          min={0}
          max={20}
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
    // TODO: connect to this.context.getStore('ItinerarySearchStore').getWalkSpeed()

    const walkingSpeedSliderValues = this.getSliderStepsArray(0.5, 3, 1.2);

    return (
      <section className="offcanvas-section">
        <Slider
          headerText={this.context.intl.formatMessage({
            id: 'walking-speed',
            defaultMessage: 'Walking speed',
          })}
          defaultValue={10}
          onSliderChange={e => {
            this.context.executeAction(
              ItinerarySearchActions.setWalkSpeed, walkingSpeedSliderValues[e.target.value]);
          }}
          min={0}
          max={20}
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
        selected={this.context.getStore('ItinerarySearchStore').getSelectedTicketOption()}
        options={this.context.getStore('ItinerarySearchStore').getTicketOptions()}
        onSelectChange={e => {
          this.context.executeAction(ItinerarySearchActions.setTicketOption, e.target.value);
        }}
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
        selected={this.context.getStore('ItinerarySearchStore').getSelectedAccessibilityOption()}
        options={this.context.getStore('ItinerarySearchStore').getAccessibilityOptions()}
        onSelectChange={e => {
          this.context.executeAction(ItinerarySearchActions.setAccessibilityOption, e.target.value);
        }}
      />
    </section>);

  render() {
    return (
      <div className="customize-search">
        <section className="offcanvas-section">
          <ModeFilter
            action={ItinerarySearchActions}
            buttonClass="mode-icon"
            selectedModes={this.context.getStore('ItinerarySearchStore').getMode()}
          />
        </section>
        <section className="offcanvas-section">
          <div className="row btn-bar">
            <ToggleButton
              icon="walk"
              onBtnClick={() =>
                this.context.executeAction(ItinerarySearchActions.toggleWalkState)}
              state={this.context.getStore('ItinerarySearchStore').getWalkState()}
              checkedClass="walk"
              className="first-btn small-4"
            />
            <ToggleButton
              icon="bicycle"
              onBtnClick={() =>
                this.context.executeAction(ItinerarySearchActions.toggleBicycleState)}
              state={this.context.getStore('ItinerarySearchStore').getBicycleState()}
              checkedClass="bicycle"
              className=" small-4"
            />
            <ToggleButton
              icon="car"
              onBtnClick={() => this.context.executeAction(ItinerarySearchActions.toggleCarState)}
              state={this.context.getStore('ItinerarySearchStore').getCarState()}
              checkedClass="car" className="last-btn small-4"
            />
          </div>
        </section>
        {config.customizeSearch.walkReluctance.available ? this.getWalkReluctanceSlider() : null}
        {config.customizeSearch.walkingSpeed.available ? this.getWalkSpeedSlider() : null}
        {config.customizeSearch.walkBoardCost.available ? this.getWalkBoardCostSlider() : null}
        {config.customizeSearch.transferMargin.available ? this.getTransferMarginSlider() : null}
        {config.customizeSearch.ticketOptions.available ? this.getTicketSelector() : null}
        {config.customizeSearch.accessibility.available ? this.getAccessibilitySelector() : null}
      </div>);
  }
}

export default CustomizeSearch;
