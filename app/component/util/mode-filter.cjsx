React        = require 'react'
ToggleButton = require './toggle-button'
config       = require '../../config'

class ModeFilter extends React.Component
  @propTypes:
    store: React.PropTypes.object.isRequired
    action: React.PropTypes.object.isRequired

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: =>
    @props.store.addChangeListener @onModeChange

  componentWillUnmount: =>
    @props.store.removeChangeListener @onModeChange

  onModeChange: =>
    @forceUpdate()

  render: =>
    store = @props.store
    action = @props.action
    <div className="btn-bar mode-filter no-select">
      {if config.transportModes.tram.availableForSelection
        <ToggleButton
          icon="bus-withoutBox"
          onBtnClick={() => @context.executeAction action.toggleBusState}
          state={store.getBusState()}
          checkedClass="bus"
          className={@props.buttonClass}
        />}

      {if config.transportModes.tram.availableForSelection
        <ToggleButton
          icon="tram-withoutBox"
          onBtnClick={() => @context.executeAction action.toggleTramState}
          state={store.getTramState()}
          checkedClass="tram"
          className={@props.buttonClass}
        />}

      {if config.transportModes.rail.availableForSelection
        <ToggleButton
          icon="rail-withoutBox"
          onBtnClick={() => @context.executeAction action.toggleRailState}
          state={store.getRailState()}
          checkedClass="rail"
          className={@props.buttonClass}
        />}

      {if config.transportModes.subway.availableForSelection
        <ToggleButton
          icon="subway-withoutBox"
          onBtnClick={() => @context.executeAction action.toggleSubwayState}
          state={store.getSubwayState()}
          checkedClass="subway"
          className={@props.buttonClass}
        />}

      {if config.transportModes.ferry.availableForSelection
        <ToggleButton
          icon="ferry-withoutBox"
          onBtnClick={() => @context.executeAction action.toggleFerryState}
          state={store.getFerryState()}
          checkedClass="ferry"
          className={@props.buttonClass}
        />}

      {if config.transportModes.citybike.availableForSelection
        <ToggleButton
          icon="citybike-withoutBox"
          onBtnClick={() => @context.executeAction action.toggleCitybikeState}
          state={store.getCitybikeState()}
          checkedClass="citybike"
          className={@props.buttonClass}
        />}

      {if config.transportModes.airplane.availableForSelection
        <ToggleButton
          icon="airplane-withoutBox"
          onBtnClick={() => @context.executeAction ModeSelectedAction.toggleAirplaneState}
          state={store.getAirplaneState()}
          checkedClass="air"
          className={@props.buttonClass}
        />}
    </div>

module.exports = ModeFilter
