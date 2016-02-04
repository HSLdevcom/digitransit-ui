React        = require 'react'
RouteNumber  = require '../departure/route-number'
Link         = require 'react-router/lib/Link'
moment       = require 'moment'
config       = require '../../config'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class TransitLeg extends React.Component

  stopCode: (leg) ->
    if leg.from.stopCode != undefined
      <span className="itinerary-stop-code">{leg.from.stopCode}</span>
    else
      undefined

  render: ->
    originalTime = if @props.leg.realTime and @props.leg.departureDelay >= config.itinerary.delayThreshold then [
      <br/>,
      <span className="original-time">
        {moment(@props.leg.startTime).subtract(@props.leg.departureDelay, 's').format('HH:mm')}
      </span>
    ] else false

    <div key={@props.index} style={{width: "100%"}} className="row itinerary-row">
      <Link to="/lahdot/#{@props.leg.tripId}">
        <div className="small-2 columns itinerary-time-column">
          <div className="itinerary-time-column-time">
            <span className={if @props.leg.realTime then "realtime" else ""}>
              {moment(@props.leg.startTime).format('HH:mm')}
            </span>
            {originalTime}
          </div>
          <RouteNumber
            mode={@props.leg.mode.toLowerCase()}
            text={@props.leg.routeShortName}
            realtime={@props.leg.realTime}
            vertical={true}
          />
        </div>
      </Link>
      <div onClick={@props.focusAction} className={"small-10 columns itinerary-instruction-column " + @props.leg.mode.toLowerCase() + if @props.index == 0 then " from" else ""}>
        {if @props.index == 0
          <div>
            <FormattedMessage id='start-journey-stop'
                              defaultMessage='Start journey from stop' />
          </div>
        else
          false}
        <div>{@props.leg.from.name} {@stopCode(@props.leg)}</div>
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
              minutes: Math.round(@props.leg.duration / 60)}}
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
