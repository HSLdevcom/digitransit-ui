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
EndpointActions = require '../action/endpoint-actions'
isEqual         = require 'lodash/isEqual'

FormattedMessage = intl.FormattedMessage

class SummaryPage extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

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
    @context.getStore('TimeStore').addChangeListener @onTimeChange
    @context.executeAction ItinerarySearchAction.itinerarySearchRequest, @props
    @setState
      search: @updateItinerarySearch @context.getStore('ItinerarySearchStore')
      time: @updateTime @context.getStore('TimeStore')

  componentWillUnmount: ->
    @context.getStore('ItinerarySearchStore').removeChangeListener @onChange
    @context.getStore('TimeStore').removeChangeListener @onTimeChange

  shouldComponentUpdate: (newProps, newState) =>
    not (@state and isEqual @props, newProps and isEqual @state, newState)

  onChange: =>
    @setState
      search: @updateItinerarySearch @context.getStore('ItinerarySearchStore')

  onTimeChange: (e) =>
    if e.selectedTime
      @setState
        time: @updateTime @context.getStore('TimeStore')

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
    search = @state?.search

    # dependencies from time store
    time = @state?.time

    if search and time
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
          <div className="summary">
            <SummaryPlanContainer
              from={from}
              to={to}
            />
            <NoRoutePopup />
          </div>
        }
        renderLoading={=> <div className="spinner-loader"/>}
      />
    else
      plan = <div className="spinner-loader"/>

    meta =
      title: @context.intl.formatMessage {id: 'itinerary-summary-page.title', defaultMessage: "Route suggestions"}
      meta: [
        {name: 'description', content: @context.intl.formatMessage {id: 'itinerary-summary-page.description', defaultMessage: "Route suggestions"}}
      ]

    <SummaryNavigation className="fullscreen">
      <Helmet {...meta} />
      {plan}
    </SummaryNavigation>


module.exports = SummaryPage
