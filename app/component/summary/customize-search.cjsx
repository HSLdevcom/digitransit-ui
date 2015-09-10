React           = require 'react'
Icon            = require '../icon/icon'
Slider              = require '../util/slider'
ToggleButton        = require '../util/toggle-button'
ItinerarySearchAction = require '../../action/itinerary-search-action'

class CustomizeSearch extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('ItinerarySearchStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('ItinerarySearchStore').removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  render: ->
    <div>
      <section className="offcanvas-section">
        <div className="row btn-bar">
          <ToggleButton icon="bus-withoutBox" onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleBusState} state={@context.getStore('ItinerarySearchStore').getBusState()} checkedClass="bus" className="columns-5 first-btn" />
          <ToggleButton icon="tram-withoutBox" onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleTramState} state={@context.getStore('ItinerarySearchStore').getTramState()} checkedClass="tram" className="columns-5" />
          <ToggleButton icon="rail-withoutBox" onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleTrainState} state={@context.getStore('ItinerarySearchStore').getTrainState()} checkedClass="train" className="columns-5" />
          <ToggleButton icon="subway-withoutBox" onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleSubwayState} state={@context.getStore('ItinerarySearchStore').getSubwayState()} checkedClass="subway" className="columns-5" />
          <ToggleButton icon="ferry-withoutBox" onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleFerryState} state={@context.getStore('ItinerarySearchStore').getFerryState()} checkedClass="ferry" className="columns-5 last-btn" />
        </div>
      </section>

      <section className="offcanvas-section">
        <div className="row btn-bar">
          <ToggleButton icon="walk" onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleWalkState} state={@context.getStore('ItinerarySearchStore').getWalkState()} checkedClass="walk" className="first-btn small-4" />
          <ToggleButton icon="cycle" onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleCycleState} state={@context.getStore('ItinerarySearchStore').getCycleState()} checkedClass="cycle" className=" small-4" />
          <ToggleButton icon="car" onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleCarState} state={@context.getStore('ItinerarySearchStore').getCarState()} checkedClass="car" className="last-btn small-4" />
        </div>
      </section>

      <section className="offcanvas-section">
        <Slider
          className="active"
          headerText={"Kävely"}
          defaultValue={@context.getStore('ItinerarySearchStore').getWalkDistance()}
          onSliderChange={() -> @context.executeAction(ItinerarySearchAction.setWalkDistance, event.target.value)}
          minText={"Vähän kävelyä"}
          maxText={"Suosi kävelyä"}
        />
      </section>
      <section className="offcanvas-section">
        <Slider
          headerText={"Vaihdot"}
          defaultValue={@context.getStore('ItinerarySearchStore').getTransportChanges()}
          onSliderChange={() -> @context.executeAction(ItinerarySearchAction.setTransportChanges, event.target.value)}
          minText={"Vähän vaihtoja"}
          maxText={"Saa olla vaihtoja"}
        />
      </section>
      <section className="offcanvas-section">
        <Slider
          min={1}
          max={13}
          headerText={"Vaihtomarginaali"}
          defaultValue={@context.getStore('ItinerarySearchStore').getWaitTime()}
          onSliderChange={() -> @context.executeAction(ItinerarySearchAction.setWaitTime, event.target.value)}
          minText={"1 min"}
          maxText={"12 min"}
        />
      </section>
      <section className="offcanvas-section">
        <Slider
          headerText={"Kävelynopeus"}
          defaultValue={@context.getStore('ItinerarySearchStore').getWalkSpeed()}
          onSliderChange={() -> @context.executeAction(ItinerarySearchAction.setWalkSpeed, event.target.value)}
          minText={"Hidas"}
          maxText={"Juoksu"}
        />
      </section>
    </div>
module.exports = CustomizeSearch
