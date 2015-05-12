React              = require 'react'
moment             = require 'moment'
Icon               = require '../icon/icon'

class SummaryRow extends React.Component
  render: ->
    data = @props.data
    startTime = moment(data.startTime)
    endTime = moment(data.endTime)
    duration = moment(endTime-startTime)
    legs = []
    legTimes = []
    MIN_SIZE = "3.7em"
    for leg, i in data.legs
      legStart = moment(leg.startTime)
      legEnd = moment(leg.endTime)
      position = ((legStart-startTime)/duration)
      width = (((legEnd-startTime)/duration))-position
      if leg.transitLeg
        legs.push <span style={{position: 'absolute', left: "calc(((100% - (#{data.legs.length} * #{MIN_SIZE})) * #{position}) + (#{i} * #{MIN_SIZE}))", width: "calc(((100% - (#{data.legs.length} * #{MIN_SIZE})) * #{width}) + #{MIN_SIZE})", 'border-bottom': '3px solid', 'overflow': 'hidden'}} className={leg.mode.toLowerCase()}><Icon key={i} className={leg.mode.toLowerCase()} img={'icon-icon_' + leg.mode.toLowerCase()} />{leg.route}</span>
        legTimes.push <span style={{position: 'absolute', left: "calc(((100% - (#{data.legs.length} * #{MIN_SIZE})) * #{position}) + (#{i} * #{MIN_SIZE}))", 'overflow': 'hidden'}} className={leg.mode.toLowerCase()}>{legStart.format("HH:mm")}</span>
      else
        legs.push <span style={{position: 'absolute', left: "calc(((100% - (#{data.legs.length} * #{MIN_SIZE})) * #{position}) + (#{i} * #{MIN_SIZE}))", width: "calc(((100% - (#{data.legs.length} * #{MIN_SIZE})) * #{width}) + #{MIN_SIZE})", 'border-bottom': '3px solid', 'overflow': 'hidden'}} className={leg.mode.toLowerCase()}><Icon key={i} className={leg.mode.toLowerCase()} img={'icon-icon_' + leg.mode.toLowerCase()} />{if leg.distance > 1000 then ((leg.distance/1000).toFixed(1) + "km") else (Math.round(leg.distance/100)*100 + "m")}</span>
        legTimes.push <span style={{position: 'absolute', left: "calc(((100% - (#{data.legs.length} * #{MIN_SIZE})) * #{position}) + (#{i} * #{MIN_SIZE}))", 'overflow': 'hidden'}} className={leg.mode.toLowerCase()}>{legStart.format("HH:mm")}</span>

    <div style={{"padding-top": "1em", "font-size": "10pt", color:"#999"}}>
      <div style={{position: "relative", width: "calc(100% - 3.5em)", 'padding-bottom': '2em', 'white-space': 'nowrap'}}>{legs}</div>
      <div style={{position: "relative", width: "calc(100% - 3.5em)", 'margin-bottom': '0em', 'white-space': 'nowrap'}}>{legTimes}{#<span className="right">{endTime.format("HH:mm")}</span>}</div>
      <div style={{position: "absolute", left: "calc(100% - 3.5em)", 'margin-top': "-2em" }}>{Math.round(duration/1000/60)}min</div>
      <div style={{position: "absolute", left: "calc(100% - 2.5em)", 'margin-top': "-0.5em" }}><Icon img={'icon-icon_arrow-right'} className="cursor-pointer"/></div>
      <br/>
    </div>


module.exports = SummaryRow