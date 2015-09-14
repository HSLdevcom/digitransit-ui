React                 = require 'react'
Icon                  = require '../icon/icon'
Slider                = require '../util/slider'
ToggleButton          = require '../util/toggle-button'
Offcanvas             = require '../util/offcanvas'
ItinerarySearchAction = require '../../action/itinerary-search-action'
Select                = require '../util/select'


class CustomizeSearch extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  @propTypes:
    open: React.PropTypes.bool

  componentDidMount: ->
    @context.getStore('ItinerarySearchStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('ItinerarySearchStore').removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  getTicketOptions: ->
    options = @context.getStore('ItinerarySearchStore').getTicketOptions()
    options.map (option, index) ->
      <option key={index} value={option.value}>{option.displayName}</option>

  render: ->
    <Offcanvas open={@props.open} className="customize-search" position="right">
      <section className="offcanvas-section">
        <div className="row btn-bar">
          <ToggleButton
            icon="bus-withoutBox"
            onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleBusState}
            state={@context.getStore('ItinerarySearchStore').getBusState()}
            checkedClass="bus"
            className="columns-5 first-btn"
          />
          <ToggleButton
            icon="tram-withoutBox"
            onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleTramState}
            state={@context.getStore('ItinerarySearchStore').getTramState()}
            checkedClass="tram"
            className="columns-5"
          />
          <ToggleButton
            icon="rail-withoutBox"
            onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleTrainState}
            state={@context.getStore('ItinerarySearchStore').getTrainState()}
            checkedClass="train"
            className="columns-5"
          />
          <ToggleButton
            icon="subway-withoutBox"
            onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleSubwayState}
            state={@context.getStore('ItinerarySearchStore').getSubwayState()}
            checkedClass="subway"
            className="columns-5"
          />
          <ToggleButton
            icon="ferry-withoutBox"
            onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleFerryState}
            state={@context.getStore('ItinerarySearchStore').getFerryState()}
            checkedClass="ferry"
            className="columns-5 last-btn"
          />
        </div>
      </section>

      <section className="offcanvas-section">
        <div className="row btn-bar">
          <ToggleButton
            icon="walk"
            onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleWalkState}
            state={@context.getStore('ItinerarySearchStore').getWalkState()}
            checkedClass="walk"
            className="first-btn small-4"
          />
          <ToggleButton
            icon="cycle"
            onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleCycleState}
            state={@context.getStore('ItinerarySearchStore').getCycleState()}
            checkedClass="cycle"
            className=" small-4"
          />
          <ToggleButton
            icon="car"
            onBtnClick={() -> @context.executeAction ItinerarySearchAction.toggleCarState}
            state={@context.getStore('ItinerarySearchStore').getCarState()}
            checkedClass="car"
            className="last-btn small-4"
          />
        </div>
      </section>

      <section className="offcanvas-section">
        <Slider
          headerText={"Kävely"}
          defaultValue={@context.getStore('ItinerarySearchStore').getWalkReluctance()}
          onSliderChange={() -> @context.executeAction(ItinerarySearchAction.setWalkReluctance, event.target.value)}
          min={1}
          max={10}
          minText={"Vähän kävelyä"}
          maxText={"Suosi kävelyä"}
        />
      </section>
      <section className="offcanvas-section">
        <Slider
          headerText={"Vaihdot"}
          defaultValue={@context.getStore('ItinerarySearchStore').getWalkBoardCost()}
          onSliderChange={() -> @context.executeAction(ItinerarySearchAction.setWalkBoardCost, event.target.value)}
          min={0}
          max={1800}
          step={60}
          minText={"Vähän vaihtoja"}
          maxText={"Saa olla vaihtoja"}
        />
      </section>
      <section className="offcanvas-section">
        <Slider
          headerText={"Vaihtomarginaali"}
          defaultValue={@context.getStore('ItinerarySearchStore').getMinTransferTime()}
          onSliderChange={() -> @context.executeAction(ItinerarySearchAction.setMinTransferTime, event.target.value)}
          min={0}
          max={900}
          step={60}
          minText={"1 min"}
          maxText={"12 min"}
        />
      </section>
      <section className="offcanvas-section">
        <Slider
          headerText={"Kävelynopeus"}
          defaultValue={@context.getStore('ItinerarySearchStore').getWalkSpeed()}
          onSliderChange={() -> @context.executeAction(ItinerarySearchAction.setWalkSpeed, event.target.value)}
          min={0.5}
          max={3}
          step={0.1}
          minText={"Hidas"}
          maxText={"Juoksu"}
        />
      </section>

      <section className="offcanvas-section">
        <Select
          headerText="Lippuvyöhykkeet"
          name="ticket"
          selected={@context.getStore('ItinerarySearchStore').getSelectedTicketOption()}
          options={@context.getStore('ItinerarySearchStore').getTicketOptions()}
          onSelectChange={() -> @context.executeAction(ItinerarySearchAction.setTicketOption, event.target.value)}
        />
      </section>
      <section className="offcanvas-section">
        <Select
          headerText="Esteettömyys"
          name="accessible"
          selected={@context.getStore('ItinerarySearchStore').getSelectedAccessibilityOption()}
          options={@context.getStore('ItinerarySearchStore').getAccessibilityOptions()}
          onSelectChange={() -> @context.executeAction(ItinerarySearchAction.setAccessibilityOption, event.target.value)}
        />
      </section>

      <section className="offcanvas-section">
        <div className="route-filter">
          <h3>Suosi tai rajaa linjoja</h3>
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
        </div>
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
    </Offcanvas>


module.exports = CustomizeSearch
