React              = require 'react'
moment             = require 'moment'
timeUtils          = require '../../util/time-utils'
Link               = require 'react-router/lib/Link'
RouteNumber        = require '../departure/route-number'
DepartureTime      = require '../departure/departure-time'
cx                 = require 'classnames'

class SummaryRow extends React.Component
  render: -> # TODO: divide into separate components/functions
    data = @props.data
    currentTime = @props.currentTime
    startTime = moment(data.startTime)
    endTime = moment(data.endTime)
    duration = endTime.diff(startTime)
    legs = []
    legTimes = []
    MIN_SIZE = "3.7em"
    for leg, i in data.legs
      isLastLeg = i == data.legs.length - 1
      isFirstLeg = i == 0
      legStart = moment(leg.startTime)
      legEnd = moment(leg.endTime)
      position = ((legStart - startTime) / duration)
      width = (((legEnd - startTime) / duration)) - position

      # TODO
      # This is a quick hack to determine whether we have enough room to show
      # last leg's start time or not. As you can imagine, this is not bulletproof
      # And does not work responsively. However, it is probably better that just
      # always hiding last leg's start time
      # This should probably be done using Matchmedia API
      isEnoughRoomForLastLegStartTime = width > 0.3

      styleLine =
        left: "calc(((100% - (#{data.legs.length} * #{MIN_SIZE})) * #{position}) + (#{i} * #{MIN_SIZE}))"
        width: "calc(((100% - (#{data.legs.length} * #{MIN_SIZE})) * #{width}) + #{MIN_SIZE} - 2px)"

      styleTime =
        left: "calc(((100% - (#{data.legs.length} * #{MIN_SIZE})) * #{position}) + (#{i} * #{MIN_SIZE}))"

      # Use either vehicle number or walking distance as text
      if leg.transitLeg and leg.mode.toLowerCase() == 'subway'
        text = " M"
      else if leg.mode == 'WAIT'
        # Use waittime in minutes
        text = " #{Math.round(leg.duration / 60)}min"
      else if leg.transitLeg and leg.route.length < 6
        text = " #{leg.route}"
      else if leg.transitLeg and leg.route.length >= 6
        # This is somewhat dirty approach. Question is: what can we show when
        # Leg's description is so long that it does not fit to screen?
        # By enabling overflow: 'hidden' above we can kind of fix this, but also
        # that option will mostly show garbage for user
        text = ""
      else
        m = Math.ceil(leg.distance / 10) * 10
        km = (leg.distance / 1000).toFixed(1)
        text = if m < 1000 then "#{m}m" else "#{km}km"

      legClasses =
        "#{leg.mode.toLowerCase()}": !isFirstLeg
        passive: @props.passive
        start: isFirstLeg
        end: isLastLeg

      legs.push <span key={i + 'a'}
        style={styleLine}
        className={cx "line", leg.mode.toLowerCase()}>
        <span key={i + 'b'} className={cx "summary-circle", legClasses}></span>
        <RouteNumber mode={leg.mode.toLowerCase()} text={text} realtime={leg.realTime}/>
      </span>

      unless isLastLeg and not isEnoughRoomForLastLegStartTime
        legTimes.push <DepartureTime
          key={i + "depTime"}
          departureTime={leg.startTime / 1000}
          realtime={leg.realTime}
          currentTime={currentTime}
          style={styleTime} />

      if isLastLeg
        legTimes.push <DepartureTime
          key="arrivalTime"
          departureTime={leg.endTime / 1000}
          realtime={leg.realTime}
          currentTime={currentTime} />

    durationText = timeUtils.durationToString(duration)

    classes = [
      "itinerary-summary-row"
      "cursor-pointer"
      passive: @props.passive
    ]

    <div className={cx classes} onClick={() => @props.onSelect(@props.hash)}>
      <div className="itinerary-legs">{legs}</div>
      <div className="itinerary-leg-times">{legTimes}</div>
      <br/>
    </div>


module.exports = SummaryRow
