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

  calcWidth: =>
    numberOfModes = 0
    for key of config.transportModes
      if config.transportModes[key].availableForSelection
        numberOfModes++
    100 / numberOfModes

  render: =>
    store = @props.store
    action = @props.action
    widthPercentage = @calcWidth()
    style = {width: "#{widthPercentage}%"}

    <div className="btn-bar mode-filter no-select">
      {if config.transportModes.bus.availableForSelection
        <ToggleButton
          icon="bus-withoutBox"
          onBtnClick={() => @context.executeAction action.toggleBusState}
          state={store.getBusState()}
          checkedClass="bus"
          style={style}
          className={@props.buttonClass}
        />}

      {if config.transportModes.tram.availableForSelection
        <ToggleButton
          icon="tram-withoutBox"
          onBtnClick={() => @context.executeAction action.toggleTramState}
          state={store.getTramState()}
          checkedClass="tram"
          style={style}
          className={@props.buttonClass}
        />}

      {if config.transportModes.rail.availableForSelection
        <ToggleButton
          icon="rail-withoutBox"
          onBtnClick={() => @context.executeAction action.toggleRailState}
          state={store.getRailState()}
          checkedClass="rail"
          style={style}
          className={@props.buttonClass}
        />}

      {if config.transportModes.subway.availableForSelection
        <ToggleButton
          icon="subway-withoutBox"
          onBtnClick={() => @context.executeAction action.toggleSubwayState}
          state={store.getSubwayState()}
          checkedClass="subway"
          style={style}
          className={@props.buttonClass}
        />}

      {if config.transportModes.ferry.availableForSelection
        <ToggleButton
          icon="ferry-withoutBox"
          onBtnClick={() => @context.executeAction action.toggleFerryState}
          state={store.getFerryState()}
          checkedClass="ferry"
          style={style}
          className={@props.buttonClass}
        />}

      {if config.transportModes.citybike.availableForSelection
        <ToggleButton
          icon="citybike-withoutBox"
          onBtnClick={() => @context.executeAction action.toggleCitybikeState}
          state={store.getCitybikeState()}
          checkedClass="citybike"
          style={style}
          className={@props.buttonClass}
        />}

      {if config.transportModes.airplane.availableForSelection
        <ToggleButton
          icon="airplane-withoutBox"
          onBtnClick={() => @context.executeAction action.toggleAirplaneState}
          state={store.getAirplaneState()}
          checkedClass="air"
          style={style}
          className={@props.buttonClass}
        />}
    </div>

module.exports = ModeFilter
