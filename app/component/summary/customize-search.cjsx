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

  getTicketOptions: ->
    options = @context.getStore('ItinerarySearchStore').getTicketOptions()
    options.map (optionText, index) ->
      <option key={index} value={index}>{optionText}</option>

  getAccessibilityOptions: ->
    options = @context.getStore('ItinerarySearchStore').getAccessibilityOptions()
    options.map (optionText, index) ->
      <option key={"accessibility-" + index} value={"accessibility-" + index}>{optionText}</option>

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
      <section className="offcanvas-section">
        <h3>Lippuvyöhykkeet</h3>
        <select>
        {@getTicketOptions()}
        </select>
      </section>
      <section className="offcanvas-section">
        <h3>Esteettömyys</h3>
        <select>
          {@getAccessibilityOptions()}
        </select>
      </section>
      <section className="offcanvas-section">
        <h3>Lisää reitille välipiste</h3>
        <div className="row">
          <div className="column small-7 remove-padding">
            <input type="text" placeholder="Kirjoita osoite" />
          </div>
          <div className="column small-5">
            <ToggleButton className="standalone-btn">Lisää</ToggleButton>
          </div>
        </div>
      </section>
      <section className="offcanvas-section">
        <h3>Lisää reitille välipiste</h3>
        <div className="row">
          <div className="column small-6 remove-padding">
            <input type="text" placeholder="" />
          </div>
          <div className="column small-3">
            <ToggleButton className="standalone-btn" icon="plus"/>
          </div>
          <div className="column small-3">
            <ToggleButton className="standalone-btn" icon="plus"/>
          </div>
        </div>
      </section>
    </div>
module.exports = CustomizeSearch
