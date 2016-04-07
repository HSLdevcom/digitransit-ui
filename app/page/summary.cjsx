Raven           = if window? then require 'raven-js' else null
React           = require 'react'
Relay           = require 'react-relay'
queries         = require '../queries'
Helmet          = require 'react-helmet'
SummaryPlanContainer  = require '../component/summary/summary-plan-container'
SummaryNavigation     = require '../component/navigation/summary-navigation'
NoRoutePopup          = require '../component/summary/no-route-popup'
ItinerarySearchAction = require '../action/itinerary-search-action'
{otpToLocation} = require '../util/otp-strings'
intl            = require 'react-intl'
config          = require '../config'

FormattedMessage = intl.FormattedMessage

class SummaryPage extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

  componentDidMount: ->
    @context.getStore('ItinerarySearchStore').addChangeListener @onChange
    @context.getStore('TimeStore').addChangeListener @onTimeChange
    @context.executeAction ItinerarySearchAction.itinerarySearchRequest, @props

  componentWillUnmount: ->
    @context.getStore('ItinerarySearchStore').removeChangeListener @onChange
    @context.getStore('TimeStore').removeChangeListener @onTimeChange

  onChange: =>
    @forceUpdate()

  onTimeChange: (e) =>
    if e.selectedTime
      @forceUpdate()

  updateItinerarySearch: (store) =>
    modes: store.getMode()
    walkReluctance: store.getWalkReluctance()
    walkBoardCost: store.getWalkBoardCost()
    minTransferTime: store.getMinTransferTime()
    walkSpeed: store.getWalkSpeed()
    wheelchair: store.isWheelchair()
    maxWalkDistance:
      if store.getMode().indexOf('BICYCLE') == -1
        config.maxWalkDistance
      else
        config.maxBikingDistance
    disableRemainingWeightHeuristic: store.getCitybikeState()

  updateTime: (store) =>
    selectedTime: store.getSelectedTime()
    arriveBy: store.getArriveBy()

  render: ->
    # dependencies from config
    preferredAgencies = config.preferredAgency or ""

    # dependencies from route params
    from = otpToLocation(@props.params.from)
    to = otpToLocation(@props.params.to)

    # dependencies from itinerary search store
    search = @updateItinerarySearch(@context.getStore('ItinerarySearchStore'))

    # dependencies from time store
    time = @updateTime(@context.getStore('TimeStore'))

    plan = <Relay.RootContainer
      Component={SummaryPlanContainer}
      route={new queries.SummaryPlanContainerRoute(
        fromPlace: @props.params.from
        toPlace: @props.params.to
        from: from
        to: to
        numItineraries: 3
        modes: search.modes
        date: time.selectedTime.format("YYYY-MM-DD")
        time: time.selectedTime.format("HH:mm:ss")
        walkReluctance: search.walkReluctance + 0.000099
        walkBoardCost: search.walkBoardCost
        minTransferTime: search.minTransferTime
        walkSpeed: search.walkSpeed + 0.000099
        maxWalkDistance: search.maxWalkDistance
        wheelchair: search.wheelchair
        preferred:
          agencies: search.preferredAgencies
        arriveBy: time.arriveBy
        disableRemainingWeightHeuristic: search.disableRemainingWeightHeuristic
      )}
      renderFailure={(error) =>
        Raven.captureMessage("OTP returned an error when requesting a plan", {extra: error})
        <div>
           <NoRoutePopup />
        </div>
      }
      renderLoading={=> <div className="spinner-loader"/>}
    />

    meta =
      title: @context.intl.formatMessage {id: 'itinerary-summary-page.title', defaultMessage: "Route suggestion"}
      meta: [
        {name: 'description', content: @context.intl.formatMessage {id: 'itinerary-summary-page.description', defaultMessage: "Route suggestion"}}
      ]

    <SummaryNavigation className="fullscreen">
      <Helmet {...meta} />
      {plan}
    </SummaryNavigation>


module.exports = SummaryPage
