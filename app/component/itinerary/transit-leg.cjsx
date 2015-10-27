React        = require 'react'
RouteNumber  = require '../departure/route-number'
moment       = require 'moment'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class TransitLeg extends React.Component

  render: ->
    <div key={@props.index} style={{width:"100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber
          mode={@props.leg.mode.toLowerCase()}
          text={@props.leg.routeShortName}
          realtime={@props.leg.realTime}
          vertical={true}
        />
      </div>
      <div className={"small-10 columns itinerary-instruction-column " + @props.leg.mode.toLowerCase() + if @props.index == 0 then " from" else ""}>
        {if @props.index == 0
          <div>
            <FormattedMessage id='start-journey-stop'
                              defaultMessage='Start journey from stop' />
          </div>
        else
          false}
        <div>{@props.leg.from.name}</div>
        <div>{if @props.leg.headsign
          <FormattedMessage
            id='route-with-headsign'
            values={{
              route: @props.leg.route
              headsign: @props.leg.headsign}}
              defaultMessage="Route {route} towards {headsign}" />
         else
           <FormattedMessage
            id='route-without-headsign'
            values={{
              route: @props.leg.route}}
              defaultMessage="Route {route}" />}
        </div>
        <div>
          <FormattedMessage
            id='num-stops'
            values={{
              stops: @props.leg.intermediateStops.length
              minutes: Math.round(@props.leg.duration/60)}}
            defaultMessage='{
              stops, plural,
              =1 {one stop}
              other {# stops}
              } ({minutes, plural,
              =1 {one minute}
              other {# minutes}})' />
        </div>
        <div><FormattedMessage
          id='alight'
          defaultMessage='Alight at stop'/>
        </div>
        <div>{@props.leg.to.name}</div>
      </div>
    </div>

module.exports = TransitLeg
