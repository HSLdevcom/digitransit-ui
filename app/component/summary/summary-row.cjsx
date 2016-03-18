React              = require 'react'
moment             = require 'moment'
timeUtils          = require '../../util/time-utils'
geoUtils           = require '../../util/geo-utils'
Link               = require 'react-router/lib/Link'
RouteNumber        = require '../departure/route-number'
DepartureTime      = require '../departure/departure-time'
cx                 = require 'classnames'
Icon  = require '../icon/icon'


class SummaryRow extends React.Component
  render: -> # TODO: divide into separate components/functions
    data = @props.data
    currentTime = @props.currentTime
    startTime = moment(data.startTime)
    endTime = moment(data.endTime)
    duration = endTime.diff(startTime)
    walkDistance = 0
    legs = []
    legTimes = []
    MIN_SIZE = "3.7em"
    for leg, i in data.legs
      isLastLeg = i == data.legs.length - 1
      isFirstLeg = i == 0
      legStart = moment(leg.startTime)
      legEnd = moment(leg.endTime)

      # Use either vehicle number or walking distance as text
      if leg.transitLeg and leg.mode.toLowerCase() == 'subway'
        text = " M"
      else if leg.mode == 'WAIT'
        # Use waittime in minutes
        #text = " #{Math.round(leg.duration / 60)}min"
      else if leg.transitLeg and leg.route.length < 6
        text = " #{leg.route}"
      else if leg.transitLeg and leg.route.length >= 6
        # This is somewhat dirty approach. Question is: what can we show when
        # Leg's description is so long that it does not fit to screen?
        # By enabling overflow: 'hidden' above we can kind of fix this, but also
        # that option will mostly show garbage for user
        text = ""
      else
        #m = Math.ceil(leg.distance / 10) * 10
        #km = (leg.distance / 1000).toFixed(1)
        #text = if m < 1000 then "#{m}m" else "#{km}km"

      legClasses =
        "#{leg.mode.toLowerCase()}": !isFirstLeg
        passive: @props.passive
        start: isFirstLeg
        end: isLastLeg

      if leg.transitLeg
        legs.push <div key={i + 'a'}
          className={cx "line", leg.mode.toLowerCase()}>
          <Icon className={leg.mode.toLowerCase()} img={'icon-icon_' + leg.mode.toLowerCase()}/>
          {text}
        </div>

    durationText = timeUtils.durationToString(duration)

    classes = [
      "itinerary-summary-row"
      "cursor-pointer"
      passive: @props.passive
    ]

    <div className={cx classes} onClick={() => @props.onSelect(@props.hash)}>
      <div className="itinerary-duration-and-distance">
        <div className="itinerary-duration">
          {moment.duration(duration).humanize()}
        </div>
        <div className="itinerary-walking-distance">
          <Icon img={'icon-icon_walk'}/>
          {geoUtils.displayDistance(data.walkDistance)}
        </div>
      </div>
      <div className="itinerary-start-time">
        {startTime.format("HH:mm")}
      </div>
      <div className="itinerary-legs">{legs}</div>
      <div className="itinerary-end-time">
        {endTime.format("HH:mm")}
      </div>
      <div className="action-arrow">
        <Icon img={'icon-icon_arrow-collapse--right'}/>
      </div>
    </div>


module.exports = SummaryRow
