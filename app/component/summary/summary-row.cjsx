React              = require 'react'
moment             = require 'moment'
Link               = require 'react-router/lib/components/Link'
Icon               = require '../icon/icon'

class SummaryRow extends React.Component

  render: ->
    data = @props.data
    startTime = moment(data.startTime)
    endTime = moment(data.endTime)
    duration = moment.duration(endTime).subtract(startTime)
    legs = []
    legTimes = []
    MIN_SIZE = "3.7em"
    for leg, i in data.legs
      isLastLeg = i == data.legs.length-1
      isFirstLeg = i == 0
      legStart = moment(leg.startTime)
      legEnd = moment(leg.endTime)
      position = ((legStart-startTime)/duration)
      width = (((legEnd-startTime)/duration))-position

      # TODO
      # This is a quick hack to determine whether we have enough room to show
      # last leg's start time or not. As you can imagine, this is not bulletproof
      # And does not work responsively. However, it is probably better that just
      # always hiding last leg's start time
      # This should probably be done using Matchmedia API
      isEnoughRoomForLastLegStartTime = width > 0.3

      # Is this row passive or not
      passiveClass = if @props.passive then " passive" else ""

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
        overflow: 'hidden'
        color: 'black'
        'fontWeight': 400
        whiteSpace: 'nowrap'

      styleTimeLast = 
        overflow: 'hidden'
        color: 'black'
        float: 'right'
        'fontWeight': '400'
        whiteSpace: 'nowrap'

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
        km = (leg.distance/1000).toFixed(1)
        text = if km == "0.0" then "0.1km" else "#{km}km"

      # Mode circle
      if isFirstLeg 
        circleClass = "start"
      else if isLastLeg
        circleClass = leg.mode.toLowerCase() + " end" 
      else 
        circleClass = leg.mode.toLowerCase()

      legs.push (
        <span key={i+'a'} style={styleLine} className={leg.mode.toLowerCase()}>  
          <span key={i+'b'} className="summary-circle #{circleClass}#{passiveClass}"></span>
          <Icon key={i+'c'} className={leg.mode.toLowerCase()} img={'icon-icon_' + leg.mode.toLowerCase()} />
          {text}
        </span>
      )

      if isFirstLeg
        legTimes.push (
          <span key={i+'a'} style={styleTime}>
            {legStart.format("HH:mm")}
          </span>
        )
      else if isLastLeg    
        if isEnoughRoomForLastLegStartTime 
          legTimes.push (
            <span key={i+'a'} style={styleTime}>
              {legStart.format("HH:mm")}
            </span>
          )

        legTimes.push (
          <span key={i+'b'} style={styleTimeLast}>
            {legEnd.format("HH:mm")}
          </span>
        )
      else
        legTimes.push (
          <span key={i+'a'} style={styleTime}>
            {legStart.format("HH:mm")}
          </span>
        )

    if duration.hours() >= 1 
      durationText = "#{duration.hours()}h #{duration.minutes()}m"
    else 
      durationText = "#{duration.minutes()} min"
    
    <div className="itinerary-summary-row cursor-pointer#{passiveClass}" onTouchTap={() => @props.onSelectRoute(@props.hash)}>
      <div className="itinerary-legs">{legs}</div>
      <div className="itinerary-leg-times">{legTimes}</div>      
      <Link className="itinerary-link" to="itinerary" params={{from: @props.params.from, to:@props.params.to, hash:@props.hash}}>
        {durationText}
        <br/>
        <Icon img={'icon-icon_arrow-right'} className="cursor-pointer"/>
      </Link>
      <br/>
    </div>


module.exports = SummaryRow
