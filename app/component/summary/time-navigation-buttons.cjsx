React = require 'react'
TimeAction = require '../../action/time-action'
moment = require 'moment'
intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class TimeNavigationButtons extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

  setEarlierSelectedTime: =>
    earliestArrivalTime = null
    for itinerary, i in @props.plan.itineraries
      endTime = moment itinerary.endTime
      if earliestArrivalTime == null
        earliestArrivalTime = endTime
      else if endTime.isBefore earliestArrivalTime
        earliestArrivalTime = endTime
    earliestArrivalTime.subtract 1, 'minutes'
    @context.executeAction TimeAction.setArrivalTime, earliestArrivalTime

  setLaterSelectedTime: =>
    latestDepartureTime = null
    for itinerary, i in @props.plan.itineraries
      startTime = moment itinerary.startTime
      if latestDepartureTime == null
        latestDepartureTime = startTime
      else if startTime.isAfter latestDepartureTime
        latestDepartureTime = startTime
    latestDepartureTime.add 1, 'minutes'
    @context.executeAction TimeAction.setDepartureTime, latestDepartureTime

  setSelectedTimeToNow: =>
    @context.executeAction TimeAction.setSelectedTime, moment()

  render: ->
    if @props.plan
      <div className="time-navigation-buttons">
        <button className="standalone-btn" onClick={@setEarlierSelectedTime}>
          <FormattedMessage id='earlier' defaultMessage='Earlier' />
        </button>
        <button className="standalone-btn" onClick={@setSelectedTimeToNow}>
          <FormattedMessage id='now' defaultMessage='Now' />
        </button>
        <button className="standalone-btn" onClick={@setLaterSelectedTime}>
          <FormattedMessage id='later' defaultMessage='Later' />
        </button>
      </div>
    else null

module.exports = TimeNavigationButtons
