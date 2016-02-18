React              = require 'react'
ToggleButton       = require '../util/toggle-button'

class ModeFilter extends React.Component
  @paramTypes:
    store: React.PropTypes.object.isRequired
    action: React.PropTypes.object.isRequired

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: =>
    @params.store.addChangeListener @onModeChange

  componentWillUnmount: =>
    @params.store.removeChangeListener @onModeChange

  onModeChange: =>
    @forceUpdate()

  render: =>
    store = @params.store
    action = @params.action
    <div className="btn-bar mode-filter no-select">
      <ToggleButton
        icon="bus-withoutBox"
        onBtnClick={() => @context.executeAction action.toggleBusState}
        state={store.getBusState()}
        checkedClass="bus"
        className="columns small-2 first-btn"
      />
      <ToggleButton
        icon="tram-withoutBox"
        onBtnClick={() => @context.executeAction action.toggleTramState}
        state={store.getTramState()}
        checkedClass="tram"
        className="columns small-2"
      />
      <ToggleButton
        icon="rail-withoutBox"
        onBtnClick={() => @context.executeAction action.toggleRailState}
        state={store.getRailState()}
        checkedClass="rail"
        className="columns small-2"
      />
      <ToggleButton
        icon="subway-withoutBox"
        onBtnClick={() => @context.executeAction action.toggleSubwayState}
        state={store.getSubwayState()}
        checkedClass="subway"
        className="columns small-2"
      />
      <ToggleButton
        icon="ferry-withoutBox"
        onBtnClick={() => @context.executeAction action.toggleFerryState}
        state={store.getFerryState()}
        checkedClass="ferry"
        className="columns small-2"
      />
      <ToggleButton
        icon="citybike-withoutBox"
        onBtnClick={() => @context.executeAction action.toggleCitybikeState}
        state={store.getCitybikeState()}
        checkedClass="citybike"
        className="columns small-2 last-btn"
      />
    </div>

module.exports = ModeFilter
