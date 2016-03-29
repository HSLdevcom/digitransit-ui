React              = require 'react'
moment             = require 'moment'
legTextUtil        = require '../../util/leg-text-util'
timeUtils          = require '../../util/time-utils'
geoUtils           = require '../../util/geo-utils'
Link               = require 'react-router/lib/Link'
RouteNumber        = require '../departure/route-number'
DepartureTime      = require '../departure/departure-time'
cx                 = require 'classnames'
Icon               = require '../icon/icon'

class SummaryRow extends React.Component

  render: -> # TODO: divide into separate components/functions
    data = @props.data
    startTime = moment(data.startTime)
    endTime = moment(data.endTime)
    duration = endTime.diff(startTime)
    legs = []

    noTransitLegs = true
    for i of data.legs
      if data.legs[i].transitLeg
        noTransitLegs = false

    for leg, i in data.legs
      if leg.transitLeg or noTransitLegs
        legs.push <RouteNumber
                    mode={leg.mode}
                    text={legTextUtil.getLegText(leg)}
                    vertical={true}
                    className={cx "line", leg.mode.toLowerCase()} />

    durationText = timeUtils.durationToString(duration)

    classes = cx [
      "itinerary-summary-row"
      "cursor-pointer"
      passive: @props.passive
    ]

    <div className={classes} onClick={() => @props.onSelect(@props.hash)}>
      <div className="itinerary-duration-and-distance">
        <div className="itinerary-duration">
          {moment.duration(duration).humanize()}
        </div>
        <div className="itinerary-walking-distance">
          <Icon img={'icon-icon_walk'} viewBox={"6 0 40 40"}/>
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
