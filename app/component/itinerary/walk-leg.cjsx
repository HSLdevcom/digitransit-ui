React        = require 'react'
RouteNumber  = require '../departure/route-number'
moment       = require 'moment'
Icon         = require '../icon/icon'
intl         = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class WalkLeg extends React.Component

  render: ->

    magnifyingClass =


    <div key={@props.index} style={{width: "100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={@props.leg.mode.toLowerCase()} vertical={true}/>
      </div>
      <div onClick={@props.focusAction} className={"small-10 columns itinerary-instruction-column " + @props.leg.mode.toLowerCase()}>
        {if @props.index == 0
          <div>
            <div>
              <Icon img={'icon-icon_mapMarker-point'} className="itinerary-icon from"/>
            </div>
            <div>
              <FormattedMessage id="start-journey-place"
                defaultMessage='Start journey from' />
              <Icon img={'icon-icon_search-plus'} className={'itinerary-search-icon'}/>
            </div>
          </div>
        else
          false }
        <div>{@props.leg.from.name} {if @props.index != 0 then <Icon img={'icon-icon_search-plus'} className={'itinerary-search-icon'}/>}</div>
        <div>{if @props.legs == @props.index + 1
          <FormattedMessage
            id="walk-to-destination"
            defaultMessage='Walk to destination' />
        else
          <FormattedMessage
            id="walk-to-stop"
            defaultMessage='Walk to stop' /> }
        </div>
        <div>{@props.leg.to.name}</div>
        <div>{Math.round(@props.leg.distance)} m ({Math.round(@props.leg.duration / 60)} <FormattedMessage id='minutes' defaultMessage='minutes' />)</div>
      </div>
    </div>


module.exports = WalkLeg
