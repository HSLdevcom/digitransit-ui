Raven              = if window? then require 'raven-js' else null
React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../queries'
Helmet             = require 'react-helmet'
SummaryPlanContainer = require '../component/summary/summary-plan-container'
SummaryNavigation    = require '../component/navigation/summary-navigation'
NoRoutePopup         = require '../component/summary/no-route-popup'
{otpToLocation, locationToCoords} = require '../util/otp-strings'
intl               = require 'react-intl'
config             = require '../config'

FormattedMessage = intl.FormattedMessage

class SummaryPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

  componentDidMount: ->
    @context.getStore('ItinerarySearchStore').addChangeListener @onChange
    @context.getStore('TimeStore').addChangeListener @onTimeChange

  componentWillUnmount: ->
    @context.getStore('ItinerarySearchStore').removeChangeListener @onChange
    @context.getStore('TimeStore').removeChangeListener @onTimeChange

  onChange: =>
    @forceUpdate()

  onTimeChange: (e) =>
    if e.selectedTime
      @forceUpdate()

  render: ->
    from = otpToLocation(@props.params.from)
    to = otpToLocation(@props.params.to)

    store = @context.getStore('ItinerarySearchStore')
    modes = store.getMode()
    walkReluctance = store.getWalkReluctance()
    walkBoardCost = store.getWalkBoardCost()
    minTransferTime = store.getMinTransferTime()
    walkSpeed = store.getWalkSpeed()
    wheelchair = store.isWheelchair()
    if store.getMode().indexOf('BICYCLE') == -1
      maxWalkDistance = config.maxWalkDistance
    else
      maxWalkDistance = config.maxBikingDistance

    arriveBy = @context.getStore('TimeStore').getArriveBy()
    selectedTime = @context.getStore('TimeStore').getSelectedTime()

    plan = <Relay.RootContainer
      Component={SummaryPlanContainer}
      route={new queries.SummaryPlanContainerRoute(
        fromPlace: @props.params.from
        toPlace: @props.params.to
        from: from
        to: to
        numItineraries: 3
        modes: modes
        date: selectedTime.format("YYYY-MM-DD")
        time: selectedTime.format("HH:mm:ss")
        walkReluctance: walkReluctance+0.000099
        walkBoardCost: walkBoardCost
        minTransferTime: minTransferTime
        walkSpeed: walkSpeed+0.000099
        maxWalkDistance: maxWalkDistance
        wheelchair: wheelchair
        arriveBy: arriveBy
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
