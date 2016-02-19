React              = require 'react'
ToggleButton       = require '../util/toggle-button'
ModeSelectedAction = require '../../action/mode-selected-action'
config             = require '../../config'

class ModeFilter extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  onModeChange: =>
    @forceUpdate()

  componentDidMount: ->
    @context.getStore("ModeStore").addChangeListener @onModeChange

  componentWillUnmount: ->
    @context.getStore("ModeStore").removeChangeListener @onModeChange

  render: ->
    store = @context.getStore('ModeStore')
    <div className="btn-bar mode-filter no-select">
      {if config.transportModes.bus.availableForSelection
        <ToggleButton
          icon="bus-withoutBox"
          onBtnClick={() => @context.executeAction ModeSelectedAction.toggleBusState}
          state={store.getBusState()}
          checkedClass="bus"
          className="small-2"
        />}

      {if config.transportModes.tram.availableForSelection
        <ToggleButton
          icon="tram-withoutBox"
          onBtnClick={() => @context.executeAction ModeSelectedAction.toggleTramState}
          state={store.getTramState()}
          checkedClass="tram"
          className="small-2"
        />}

      {if config.transportModes.rail.availableForSelection
        <ToggleButton
          icon="rail-withoutBox"
          onBtnClick={() => @context.executeAction ModeSelectedAction.toggleRailState}
          state={store.getRailState()}
          checkedClass="rail"
          className="small-2"
        />}

      {if config.transportModes.subway.availableForSelection
        <ToggleButton
          icon="subway-withoutBox"
          onBtnClick={() => @context.executeAction ModeSelectedAction.toggleSubwayState}
          state={store.getSubwayState()}
          checkedClass="subway"
          className="small-2"
        />}

      {if config.transportModes.ferry.availableForSelection
        <ToggleButton
          icon="ferry-withoutBox"
          onBtnClick={() => @context.executeAction ModeSelectedAction.toggleFerryState}
          state={store.getFerryState()}
          checkedClass="ferry"
          className="small-2"
        />}

      {if config.transportModes.airplane.availableForSelection
        <ToggleButton
          icon="airplane-withoutBox"
          onBtnClick={() => @context.executeAction ModeSelectedAction.toggleAirplaneState}
          state={store.getAirplaneState()}
          checkedClass="air"
          className="small-2"
        />}
    </div>

module.exports = ModeFilter
