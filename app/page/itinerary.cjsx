React             = require 'react'
Relay             = require 'react-relay'
Helmet            = require 'react-helmet'
DefaultNavigation = require('../component/navigation/DefaultNavigation').default
intl              = require 'react-intl'
{otpToLocation}   = require '../util/otp-strings'
config            = require '../config'
ItineraryPlanContainer = require '../component/itinerary/itinerary-plan-container'
queries           = require '../queries'
EndpointActions   = require '../action/endpoint-actions'
isEqual           = require 'lodash/isEqual'
NoRoutePopup      = require '../component/summary/no-route-popup'

class ItineraryPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired
    router: React.PropTypes.object.isRequired

  @loadAction: (params) ->
    [
      [EndpointActions.storeEndpoint,
        target: "origin",
        endpoint: otpToLocation(params.from)],
      [EndpointActions.storeEndpoint,
        target: "destination",
        endpoint: otpToLocation(params.to)]
    ]

  componentDidMount: ->
    @context.getStore('ItinerarySearchStore').addChangeListener @onChange
    #@context.getStore('TimeStore').addChangeListener @onTimeChange
    #@context.executeAction ItinerarySearchAction.itinerarySearchRequest, @props
    @setState
      search: @updateItinerarySearch @context.getStore('ItinerarySearchStore')
      time: @updateTime @context.getStore('TimeStore')

  componentWillUnmount: ->
    @context.getStore('ItinerarySearchStore').removeChangeListener @onChange
    #@context.getStore('TimeStore').removeChangeListener @onTimeChange

  shouldComponentUpdate: (newProps, newState) =>
    not (@state and isEqual @props, newProps and isEqual @state, newState)

  onChange: =>
    @setState
      search: @updateItinerarySearch @context.getStore('ItinerarySearchStore')

  #onTimeChange: (e) =>
  #  if e.selectedTime
  #    @setState
  #      time: @updateTime @context.getStore('TimeStore')

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

  render: =>
    # dependencies from config
    preferredAgencies = config.preferredAgency or ""

    # dependencies from route params
    from = otpToLocation(@props.params.from)
    to = otpToLocation(@props.params.to)

    # dependencies from itinerary search store
    search = @state?.search

    # dependencies from time store
    time = @state?.time

    if search and time
      plan = <Relay.RootContainer
        Component={ItineraryPlanContainer}
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
          maxWalkDistance: search.maxWalkDistance + 0.1
          wheelchair: search.wheelchair
          preferred:
            agencies: search.preferredAgencies
          arriveBy: time.arriveBy
          disableRemainingWeightHeuristic: search.disableRemainingWeightHeuristic
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
    else
      plan = <div className="spinner-loader"/>

    title = @context.intl.formatMessage {id: 'itinerary-page.title', defaultMessage: "Route"}
    meta =
      title: title
      meta: [
        {name: 'description', content: @context.intl.formatMessage {id: 'itinerary-page.description', defaultMessage: "Route"}}
      ]

    <DefaultNavigation className="fullscreen" title={title}>
      <Helmet {...meta} />
      {plan}
    </DefaultNavigation>


module.exports = ItineraryPage
