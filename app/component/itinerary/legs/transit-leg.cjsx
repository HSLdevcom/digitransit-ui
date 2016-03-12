React        = require 'react'
RouteNumber  = require '../../departure/route-number'
Link         = require 'react-router/lib/Link'
moment       = require 'moment'
config       = require '../../../config'
Icon         = require '../../icon/icon'
timeUtils    = require '../../../util/time-utils'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class TransitLeg extends React.Component
  @contextTypes:
    intl: intl.intlShape.isRequired

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
        <div className="itinerary-leg-first-row">
          <div>
            {@props.leg.from.name}
            {@props.children}
            <Icon img={'icon-icon_arrow-collapse--right'} className={'itinerary-leg-first-row__arrow'}/>
          </div>
          <Icon img={'icon-icon_search-plus'} className={'itinerary-search-icon'}/>
        </div>
        <div className='itinerary-transit-leg-route'>
          <div className={'capitalize'}>
            <FormattedMessage
              id={@props.leg.mode.toLowerCase()}
              defaultMessage={@props.leg.mode.toLowerCase()}
            /> {@props.leg.route}
          </div>
        </div>
        <div className='itinerary-leg-intermediate-stops'>
          <FormattedMessage
            id={'number-of-intermediate-stops'}
            values= {{
              number: @props.leg.intermediateStops.length.toString()
              duration: timeUtils.durationToString(@props.leg.duration * 1000)
              }}
            defaultMessage={'{number} stops ({duration})'}/>
        </div>
        <div className="itinerary-leg-action">
          <FormattedMessage
            id={'get-off-at-stop'}
            defaultMessage={'Alight at stop'}
          />
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
