React                 = require 'react'
Icon                  = require '../icon/icon'
Slider                = require '../util/slider'
ToggleButton          = require '../util/toggle-button'
ModeFilter            = require '../util/mode-filter'
ItinerarySearchAction = require '../../action/itinerary-search-action'
Select                = require '../util/select'
config                = require '../../config'

intl = require 'react-intl'

class CustomizeSearch extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

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
    <div className="customize-search">
      <section className="offcanvas-section">
        <ModeFilter store={@context.getStore('ItinerarySearchStore')} action={ItinerarySearchAction} buttonClass="mode-icon"/>
      </section>

      <section className="offcanvas-section">
        <div className="row btn-bar">
          <ToggleButton
            icon="walk"
            onBtnClick={() => @context.executeAction ItinerarySearchAction.toggleWalkState}
            state={@context.getStore('ItinerarySearchStore').getWalkState()}
            checkedClass="walk"
            className="first-btn small-4"
          />
          <ToggleButton
            icon="bicycle"
            onBtnClick={() => @context.executeAction ItinerarySearchAction.toggleBicycleState}
            state={@context.getStore('ItinerarySearchStore').getBicycleState()}
            checkedClass="bicycle"
            className=" small-4"
          />
          <ToggleButton
            icon="car"
            onBtnClick={() => @context.executeAction ItinerarySearchAction.toggleCarState}
            state={@context.getStore('ItinerarySearchStore').getCarState()}
            checkedClass="car"
            className="last-btn small-4"
          />
        </div>
      </section>

      {if config.customizeSearch.walkReluctance.available
        <section className="offcanvas-section">
          <Slider
            headerText={@context.intl.formatMessage(
              {id: 'walking', defaultMessage: "Walking"})}
            defaultValue={@context.getStore('ItinerarySearchStore').getWalkReluctance()}
            onSliderChange={(e) => @context.executeAction(ItinerarySearchAction.setWalkReluctance, e.target.value)}
            min={0.8}
            max={10}
            step={0.2}
            minText={@context.intl.formatMessage(
              {id: 'prefer-walking', defaultMessage: "Prefer walking"})}
            maxText={@context.intl.formatMessage(
              {id: 'avoid-walking', defaultMessage: "Avoid walking"})}
          />
        </section>}

      {if config.customizeSearch.walkBoardCost.available
        <section className="offcanvas-section">
          <Slider
            headerText={@context.intl.formatMessage(
              {id: 'transfers', defaultMessage: "Transfers"})}
            defaultValue={@context.getStore('ItinerarySearchStore').getWalkBoardCost()}
            onSliderChange={(e) => @context.executeAction(ItinerarySearchAction.setWalkBoardCost, e.target.value)}
            min={1}
            max={1800}
            step={60}
            minText={@context.intl.formatMessage(
              {id: 'transfers-allowed', defaultMessage: "Transfers allowed"})}
            maxText={@context.intl.formatMessage(
              {id: 'avoid-transfers', defaultMessage: "Avoid transfers"})}
          />
        </section>
      }
      {if config.customizeSearch.transferMargin.available
        <section className="offcanvas-section">
          <Slider
            headerText={@context.intl.formatMessage(
              {id: 'transfers-margin', defaultMessage: "Transfer margin"})}
            defaultValue={@context.getStore('ItinerarySearchStore').getMinTransferTime()}
            onSliderChange={(e) => @context.executeAction(ItinerarySearchAction.setMinTransferTime, e.target.value)}
            min={60}
            max={660}
            step={30}
            minText={"1 min"}
            maxText={"12 min"}
          />
        </section>}

      {if config.customizeSearch.walkingSpeed.available
        <section className="offcanvas-section">
          <Slider
            headerText={@context.intl.formatMessage(
              {id: 'walking-speed', defaultMessage: "Walking speed"})}
            defaultValue={@context.getStore('ItinerarySearchStore').getWalkSpeed()}
            onSliderChange={(e) => @context.executeAction(ItinerarySearchAction.setWalkSpeed, e.target.value)}
            min={0.5}
            max={3}
            step={0.1}
            minText={@context.intl.formatMessage(
              {id: 'slow', defaultMessage: "Slow"})}
            maxText={@context.intl.formatMessage(
              {id: 'run', defaultMessage: "Run"})}
          />
        </section>}

      {if config.customizeSearch.ticketOptions.available
        <section className="offcanvas-section">
          <Select
            headerText={@context.intl.formatMessage(
              {id: 'zones', defaultMessage: "Zones"})}
            name="ticket"
            selected={@context.getStore('ItinerarySearchStore').getSelectedTicketOption()}
            options={@context.getStore('ItinerarySearchStore').getTicketOptions()}
            onSelectChange={(e) => @context.executeAction(ItinerarySearchAction.setTicketOption, e.target.value)}
          />
        </section>}

      {if config.customizeSearch.accessibility.available
        <section className="offcanvas-section">
          <Select
            headerText={@context.intl.formatMessage(
              {id: 'accessibility', defaultMessage: "Accessibility"})}
            name="accessible"
            selected={@context.getStore('ItinerarySearchStore').getSelectedAccessibilityOption()}
            options={@context.getStore('ItinerarySearchStore').getAccessibilityOptions()}
            onSelectChange={(e) => @context.executeAction(ItinerarySearchAction.setAccessibilityOption, e.target.value)}
          />
        </section>}

    </div>


module.exports = CustomizeSearch
