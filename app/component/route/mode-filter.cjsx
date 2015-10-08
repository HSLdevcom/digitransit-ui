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
    <div className="row btn-bar mode-filter">
      <ToggleButton
        icon="bus-withoutBox"
        onBtnClick={() -> @context.executeAction ModeSelectedAction.toggleBusState}
        state={store.getBusState()}
        checkedClass="bus"
        className="columns-5 first-btn"
      />
      <ToggleButton
        icon="tram-withoutBox"
        onBtnClick={() -> @context.executeAction ModeSelectedAction.toggleTramState}
        state={store.getTramState()}
        checkedClass="tram"
        className="columns-5"
      />
      <ToggleButton
        icon="rail-withoutBox"
        onBtnClick={() -> @context.executeAction ModeSelectedAction.toggleRailState}
        state={store.getRailState()}
        checkedClass="rail"
        className="columns-5"
      />
      <ToggleButton
        icon="subway-withoutBox"
        onBtnClick={() -> @context.executeAction ModeSelectedAction.toggleSubwayState}
        state={store.getSubwayState()}
        checkedClass="subway"
        className="columns-5"
      />
      <ToggleButton
        icon="ferry-withoutBox"
        onBtnClick={() -> @context.executeAction ModeSelectedAction.toggleFerryState}
        state={store.getFerryState()}
        checkedClass="ferry"
        className="columns-5 last-btn"
      />
    </div>

module.exports = ModeFilter
