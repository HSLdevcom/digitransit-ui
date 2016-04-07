React             = require 'react'
Relay             = require 'react-relay'
Helmet            = require 'react-helmet'
DefaultNavigation = require '../component/navigation/default-navigation'
intl              = require 'react-intl'
{otpToLocation}   = require '../util/otp-strings'
config            = require '../config'
ItineraryPlanContainer = require '../component/itinerary/itinerary-plan-container'
queries           = require '../queries'

class ItineraryPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired
    router: React.PropTypes.object.isRequired

  render: =>
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

    preferredAgencies = config.preferredAgency or ""
    disableRemainingWeightHeuristic = store.getCitybikeState()

    plan = <Relay.RootContainer
      Component={ItineraryPlanContainer}
      route={new queries.SummaryPlanContainerRoute(
        fromPlace: @props.params.from
        toPlace: @props.params.to
        numItineraries: 3
        modes: modes
        date: selectedTime.format("YYYY-MM-DD")
        time: selectedTime.format("HH:mm:ss")
        walkReluctance: walkReluctance + 0.000099
        walkBoardCost: walkBoardCost
        minTransferTime: minTransferTime
        walkSpeed: walkSpeed + 0.000099
        maxWalkDistance: maxWalkDistance
        wheelchair: wheelchair
        preferred:
          agencies: preferredAgencies
        arriveBy: arriveBy
        disableRemainingWeightHeuristic: disableRemainingWeightHeuristic
        hash: @props.params.hash
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
      title: @context.intl.formatMessage {id: 'itinerary-page.title', defaultMessage: "Route"}
      meta: [
        {name: 'description', content: @context.intl.formatMessage {id: 'itinerary-page.description', defaultMessage: "Route"}}
      ]

    <DefaultNavigation className="fullscreen">
      <Helmet {...meta} />
      {plan}
    </DefaultNavigation>


module.exports = ItineraryPage
