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
    <div className="row btn-bar">
      <ToggleButton
        icon="bus-withoutBox"
        onBtnClick={() -> @context.executeAction ModeSelectedAction.toggleBusState}
        state={@context.getStore('ModeStore').getBusState()}
        checkedClass="bus"
        className="columns-5 first-btn"
      />
      <ToggleButton
        icon="tram-withoutBox"
        onBtnClick={() -> @context.executeAction ModeSelectedAction.toggleTramState}
        state={@context.getStore('ModeStore').getTramState()}
        checkedClass="tram"
        className="columns-5"
      />
      <ToggleButton
        icon="rail-withoutBox"
        onBtnClick={() -> @context.executeAction ModeSelectedAction.toggleRailState}
        state={@context.getStore('ModeStore').getRailState()}
        checkedClass="rail"
        className="columns-5"
      />
      <ToggleButton
        icon="subway-withoutBox"
        onBtnClick={() -> @context.executeAction ModeSelectedAction.toggleSubwayState}
        state={@context.getStore('ModeStore').getSubwayState()}
        checkedClass="subway"
        className="columns-5"
      />
      <ToggleButton
        icon="ferry-withoutBox"
        onBtnClick={() -> @context.executeAction ModeSelectedAction.toggleFerryState}
        state={@context.getStore('ModeStore').getFerryState()}
        checkedClass="ferry"
        className="columns-5 last-btn"
      />
    </div>

module.exports = ModeFilter
