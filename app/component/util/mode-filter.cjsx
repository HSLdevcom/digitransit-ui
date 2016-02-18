React        = require 'react'
ToggleButton = require '../util/toggle-button'
cx           = require 'classnames'

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
      <ToggleButton
        icon="bus-withoutBox"
        onBtnClick={() => @context.executeAction action.toggleBusState}
        state={store.getBusState()}
        checkedClass="bus"
        className={cx @props.buttonClass, "first-btn"}
      />
      <ToggleButton
        icon="tram-withoutBox"
        onBtnClick={() => @context.executeAction action.toggleTramState}
        state={store.getTramState()}
        checkedClass="tram"
        className={@props.buttonClass}
      />
      <ToggleButton
        icon="rail-withoutBox"
        onBtnClick={() => @context.executeAction action.toggleRailState}
        state={store.getRailState()}
        checkedClass="rail"
        className={@props.buttonClass}
      />
      <ToggleButton
        icon="subway-withoutBox"
        onBtnClick={() => @context.executeAction action.toggleSubwayState}
        state={store.getSubwayState()}
        checkedClass="subway"
        className={@props.buttonClass}
      />
      <ToggleButton
        icon="ferry-withoutBox"
        onBtnClick={() => @context.executeAction action.toggleFerryState}
        state={store.getFerryState()}
        checkedClass="ferry"
        className={@props.buttonClass}
      />
      <ToggleButton
        icon="citybike-withoutBox"
        onBtnClick={() => @context.executeAction action.toggleCitybikeState}
        state={store.getCitybikeState()}
        checkedClass="citybike"
        className={cx @props.buttonClass, "last-btn"}
      />
    </div>

module.exports = ModeFilter
