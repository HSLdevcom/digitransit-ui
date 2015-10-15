React              = require 'react'
moment             = require 'moment'
Link               = require 'react-router/lib/Link'
Icon               = require '../icon/icon'
RouteNumber        = require '../departure/route-number'
DepartureTime      = require '../departure/departure-time'
classNames         = require 'classnames'

class SummaryRow extends React.Component

  render: ->
    data = @props.data
    currentTime = moment()
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
        position: 'absolute'
        left: "calc(((100% - (#{data.legs.length} * #{MIN_SIZE})) * #{position}) + (#{i} * #{MIN_SIZE}))"
        width: "calc(((100% - (#{data.legs.length} * #{MIN_SIZE})) * #{width}) + #{MIN_SIZE} - 2px)"
        borderBottom: '3px solid'
        whiteSpace: 'nowrap'
        # By enabling this mode circles will not show
        #overflow: 'hidden'

      styleTime =
        position: 'absolute'
        left: "calc(((100% - (#{data.legs.length} * #{MIN_SIZE})) * #{position}) + (#{i} * #{MIN_SIZE}))"

      styleTimeLast =
        float: 'right'

      # Use either vehicle number or walking distance as text
      if leg.transitLeg and leg.mode.toLowerCase() == 'subway'
        text = " M"
      else if leg.transitLeg and leg.route.length < 6
        text = " #{leg.route}"
      else if leg.transitLeg and leg.route.length >= 6
        # This is somewhat dirty approach. Question is: what can we show when
        # Leg's description is so long that it does not fit to screen?
        # By enabling overflow: 'hidden' above we can kind of fix this, but also
        # that option will mostly show garbage for user
        text = ""
      else
        km = (leg.distance / 1000).toFixed(1)
        text = if km == "0.0" then "0.1km" else "#{km}km"

      legClasses =
        "#{leg.mode.toLowerCase()}": !isFirstLeg
        passive: @props.passive
        start: isFirstLeg
        end: isLastLeg

      legs.push <span key={i + 'a'}
        style={styleLine}
        className={leg.mode.toLowerCase()}>
        <span key={i + 'b'} className={classNames("summary-circle", legClasses)}></span>
        <RouteNumber mode={leg.mode.toLowerCase()} text={text}/>
      </span>

      unless isLastLeg and not isEnoughRoomForLastLegStartTime
        legTimes.push <DepartureTime
          departureTime={leg.startTime / 1000}
          realtime={leg.realTime}
          currentTime={currentTime}
          style={styleTime} />

      if isLastLeg
        legTimes.push <DepartureTime
          departureTime={leg.endTime / 1000}
          realtime={leg.realTime}
          currentTime={currentTime}
          style={styleTimeLast} />

    duration = moment.duration(duration)
    if duration.hours() >= 1
      durationText = "#{duration.hours()}h #{duration.minutes()}min"
    else
      durationText = "#{duration.minutes()} min"

    classes = [
      "itinerary-summary-row"
      "cursor-pointer"
      passive: @props.passive
    ]

    <div className={classNames(classes)} onClick={() => @props.onSelect(@props.hash)}>
      <div className="itinerary-legs">{legs}</div>
      <div className="itinerary-leg-times">{legTimes}</div>
      <Link className="itinerary-link" to="#{process.env.ROOT_PATH}reitti/#{@props.params.from}/#{@props.params.to}/#{@props.hash}">
        {durationText}
        <br/>
        <Icon img={'icon-icon_arrow-right'} className="cursor-pointer"/>
      </Link>
      <br/>
    </div>


module.exports = SummaryRow
