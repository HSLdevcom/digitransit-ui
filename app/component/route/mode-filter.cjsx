React              = require 'react'
ToggleButton       = require '../util/toggle-button'
ModeSelectedAction = require '../../action/mode-selected-action'

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
      <ToggleButton
        icon="bus-withoutBox"
        onBtnClick={() => @context.executeAction ModeSelectedAction.toggleBusState}
        state={store.getBusState()}
        checkedClass="bus"
        className="columns small-2 first-btn"
      />
      <ToggleButton
        icon="tram-withoutBox"
        onBtnClick={() => @context.executeAction ModeSelectedAction.toggleTramState}
        state={store.getTramState()}
        checkedClass="tram"
        className="columns small-2"
      />
      <ToggleButton
        icon="rail-withoutBox"
        onBtnClick={() => @context.executeAction ModeSelectedAction.toggleRailState}
        state={store.getRailState()}
        checkedClass="rail"
        className="columns small-2"
      />
      <ToggleButton
        icon="subway-withoutBox"
        onBtnClick={() => @context.executeAction ModeSelectedAction.toggleSubwayState}
        state={store.getSubwayState()}
        checkedClass="subway"
        className="columns small-2"
      />
      <ToggleButton
        icon="ferry-withoutBox"
        onBtnClick={() => @context.executeAction ModeSelectedAction.toggleFerryState}
        state={store.getFerryState()}
        checkedClass="ferry"
        className="columns small-2"
      />
      <ToggleButton
        icon="airplane-withoutBox"
        onBtnClick={() => @context.executeAction ModeSelectedAction.toggleAirplaneState}
        state={store.getAirplaneState()}
        checkedClass="air"
        className="columns small-2 last-btn"
      />
    </div>

module.exports = ModeFilter
