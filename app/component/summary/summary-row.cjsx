React              = require 'react'
moment             = require 'moment'
Icon               = require '../icon/icon'

class SummaryRow extends React.Component
  render: ->
    data = @props.data
    startTime = moment(data.startTime)
    endTime = moment(data.endTime)
    legs = []
    legTimes = []
    MIN_SIZE = "3.5em"
    for leg, i in data.legs
      legStart = moment(leg.startTime)
      legEnd = moment(leg.endTime)
      position = ((legStart-startTime)/(endTime-startTime))
      width = (((legEnd-startTime)/(endTime-startTime)))-position
      if leg.transitLeg
        legs.push <span style={{position: 'absolute', left: "calc(((100% - (" + data.legs.length + " * " + MIN_SIZE + ")) * " + position + ") + (" + i + " * " + MIN_SIZE + "))", width: "calc(((100% - (" + data.legs.length + " * " + MIN_SIZE + ")) * " + width + ") + " + MIN_SIZE + ")", 'border-bottom': '3px solid', 'overflow': 'hidden'}} className={leg.mode.toLowerCase()}><Icon key={i} className={leg.mode.toLowerCase()} img={'icon-icon_' + leg.mode.toLowerCase()} />{leg.route}</span>
        legTimes.push <span style={{position: 'absolute', left: "calc(((100% - (" + data.legs.length + " * " + MIN_SIZE + ")) * " + position + ") + (" + i + " * " + MIN_SIZE + "))", 'overflow': 'hidden'}} className={leg.mode.toLowerCase()}>{legStart.format("HH:mm")}</span>
      else
        legs.push <span style={{position: 'absolute', left: "calc(((100% - (" + data.legs.length + " * " + MIN_SIZE + ")) * " + position + ") + (" + i + " * " + MIN_SIZE + "))", width: "calc(((100% - (" + data.legs.length + " * " + MIN_SIZE + ")) * " + width + ") + " + MIN_SIZE + ")", 'border-bottom': '3px solid', 'overflow': 'hidden'}} className={leg.mode.toLowerCase()}><Icon key={i} className={leg.mode.toLowerCase()} img={'icon-icon_' + leg.mode.toLowerCase()} />{Math.round(leg.distance) + "m"}</span>

    <div style={{"padding-top": "1em"}}>
      <div style={{'padding-bottom': '2em', 'white-space': 'nowrap'}}>{legs}</div>
      <div style={{'margin-bottom': '0em', 'white-space': 'nowrap'}}><span className="left">{startTime.format("HH:mm")}</span>{legTimes}<span className="right">{endTime.format("HH:mm")}</span></div>
      <br/>
    </div>


module.exports = SummaryRow