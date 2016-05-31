React        = require 'react'
RouteNumber  = require('../../departure/RouteNumber').default
Link         = require 'react-router/lib/Link'
moment       = require 'moment'
config       = require '../../../config'
Icon         = require '../../icon/icon'
timeUtils    = require '../../../util/time-utils'
StopCode     = require '../stop-code'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class TransitLeg extends React.Component
  stopCode: (stopCode) ->
    if stopCode
      <StopCode code={stopCode}/>
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
      <Link to="/lahdot/#{@props.leg.trip.gtfsId}">
        <div className="small-2 columns itinerary-time-column">
          <div className="itinerary-time-column-time">
            <span className={if @props.leg.realTime then "realtime" else ""}>
              {moment(@props.leg.startTime).format('HH:mm')}
            </span>
            {originalTime}
          </div>
          <RouteNumber
            mode={@props.mode.toLowerCase()}
            text={@props.leg.route?.shortName}
            realtime={@props.leg.realTime}
            vertical={true}
          />
        </div>
      </Link>
      <div onClick={@props.focusAction}  className={"small-10 columns itinerary-instruction-column " + @props.mode.toLowerCase() + if @props.index == 0 then " from" else ""}>
        <div className="itinerary-leg-first-row">
          <div>
            {@props.leg.from.name}
            {@stopCode @props.leg.from.stop?.code}
            <Icon img={'icon-icon_arrow-collapse--right'} className={'itinerary-leg-first-row__arrow'}/>
          </div>
          <Icon img={'icon-icon_search-plus'} className={'itinerary-search-icon'}/>
        </div>
        <div className='itinerary-transit-leg-route'>
          {@props.children}
        </div>
        <div className='itinerary-leg-intermediate-stops'>
          <FormattedMessage
            id={'number-of-intermediate-stops'}
            values= {{
              number: @props.leg.intermediateStops?.length or 0
              duration: timeUtils.durationToString(@props.leg.duration * 1000)
              }}
            defaultMessage={'{number, plural,
              =0 {No intermediate stops}
              other {{number} stops}
            } ({duration})'}/>
        </div>
      </div>
    </div>


module.exports = TransitLeg
