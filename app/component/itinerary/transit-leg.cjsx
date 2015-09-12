React = require 'react'
Icon  = require '../icon/icon'
moment = require 'moment'

intl = require('react-intl')
FormattedMessage = intl.FormattedMessage

class TransitLeg extends React.Component

  render: ->
    <div key={@props.index} style={{width:"100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.leg.startTime).format('HH:mm')}
        </div>
        <Icon className={@props.leg.mode.toLowerCase()} img={'icon-icon_' + @props.leg.mode.toLowerCase() }/>
        <div className={"ilinerary-time-column-route " + @props.leg.mode.toLowerCase()}>
          {@props.leg.routeShortName}
        </div>
      </div>
      <div className={"small-10 columns itinerary-instruction-column " + @props.leg.mode.toLowerCase() + if @props.index == 0 then " from" else ""}>
        {if @props.index == 0
          <div>
            <FormattedMessage id='start-journey-stop'
                              defaultMessage='Aloita matka pysäkiltä' />
          </div>
        else
          false}
        <div>{@props.leg.from.name}</div>
        <div>{if @props.leg.headsign
               <FormattedMessage id='route-with-headsign'
                                 values={{
                                   route: @props.leg.route
                                   headsign: @props.leg.headsign}}
                                 defaultMessage="Linja {route} suuntaan {headsign}" />
             else
               <FormattedMessage id='route-without-headsign'
                                 values={{
                                   route: @props.leg.route}}
                                 defaultMessage="Linja {route}" />}
        </div>
        <div>
          <FormattedMessage
            id='num-stops'
            values={{
                stops: @props.leg.intermediateStops.length
                minutes: Math.round(@props.leg.duration/60)}}
            defaultMessage='{stops, plural,
                             =1 {yksi pysäkki}
                             other {# pysäkkiä}
                            }({minutes, plural,
                               =1 {one minute}
                               other {# minutes}})' />
        </div>
        <div><FormattedMessage id='alight'
                               defaultMessage='Nouse kyydistä pysäkillä' /></div>
        <div>{@props.leg.to.name}</div>
      </div>
    </div>

module.exports = TransitLeg
