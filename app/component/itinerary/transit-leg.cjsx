React        = require 'react'
RouteNumber  = require '../departure/route-number'
Link         = require 'react-router/lib/Link'
moment       = require 'moment'
config       = require '../../config'
Icon         = require '../icon/icon'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class TransitLeg extends React.Component
  @contextTypes:
    intl: intl.intlShape.isRequired

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
      <div onClick={@props.focusAction}  className={"small-10 columns itinerary-instruction-column " + @props.leg.mode.toLowerCase() + if @props.index == 0 then " from" else ""}>
        <div>
          <FormattedMessage
            id='transit-from-to'
            values={{
              transitMode: @context.intl.formatMessage({id: @props.leg.mode.toLowerCase(), defaultMessage: @props.leg.mode.toLowerCase()})
              fromName: <b>{@props.leg.from.name}</b>
              toName: <b>{@props.leg.to.name}</b>
              duration: moment.duration(@props.leg.duration, 'seconds').humanize()}}
            }}
            defaultMessage='Take the {transitMode} from {fromName} to {toName} ({duration})' />
        </div>
        <div>
          {@stopCode(@props.leg)}
          {if @props.leg.headsign && @props.leg.headsign != @props.leg.to.name
            <FormattedMessage
              id='route-with-headsign'
              values={{
                headsign: @props.leg.headsign}}
                defaultMessage="Route: towards {headsign}" />
          else
            <FormattedMessage
              id='route-without-headsign'
              values={{
                route: @props.leg.route}}
                defaultMessage="Route {route}" />}

          <Icon img={'icon-icon_search-plus'} className={'itinerary-search-icon'}/>
        </div>
        <div>{if @props.leg.intermediateStops.length > 0 && @props.leg.mode == 'AIRPLANE'
          <FormattedMessage
            id='num-stops-flight'
            values={{
              stops: @props.leg.intermediateStops.length}}
            defaultMessage='{
              stops, plural,
              =1 {one stop}
              other {# stops}
              }' />}
        </div>
      </div>
    </div>


module.exports = TransitLeg
