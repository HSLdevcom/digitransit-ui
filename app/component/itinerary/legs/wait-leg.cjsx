React            = require 'react'
RouteNumber      = require('../../departure/RouteNumber').default
moment           = require 'moment'
Icon             = require '../../icon/icon'
intl             = require 'react-intl'
FormattedMessage = intl.FormattedMessage
timeUtils        = require '../../../util/time-utils'

class WaitLeg extends React.Component

  render: ->
    duration = timeUtils.durationToString(@props.leg.duration * 1000)

    <div style={{width: "100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={'wait'} vertical={true}/>
      </div>
      <div onClick={@props.focusAction} className={"small-10 columns itinerary-instruction-column wait"}>
        <div className='itinerary-leg-first-row'>
          <div>
            {@props.leg.to.name}
            {@props.children}
            {if @props.leg.from.stop?.code then <Icon img={'icon-icon_arrow-collapse--right'} className={'itinerary-leg-first-row__arrow'}/>}
          </div>
          <Icon img={'icon-icon_search-plus'} className={'itinerary-search-icon'}/>
        </div>
        <div className="itinerary-leg-action">
          <FormattedMessage
            id={'wait-amount-of-time'}
            values={{
              duration: "(" + timeUtils.durationToString(@props.waitTime) + ")"}}
            defaultMessage={'Wait {duration}'} />
        </div>
      </div>
    </div>


module.exports = WaitLeg
