React = require 'react'
intl = require 'react-intl'
moment = require 'moment'
RouteNumber = require '../../departure/route-number'
Icon = require '../../icon/icon'

FormattedMessage = intl.FormattedMessage

class AirportCollectLuggageLeg extends React.Component

  render: ->
    <div style={{width: "100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.leg.endTime).format('HH:mm')}
        </div>
        <RouteNumber mode={'wait'} vertical={true}/>
      </div>
      <div onClick={@props.focusAction} className={"small-10 columns itinerary-instruction-column wait"}>
        <div className="itinerary-leg-first-row">
          <FormattedMessage
            id='airport-collect-luggage'
            defaultMessage='Collect your luggage, if any.' />
          <Icon img={'icon-icon_search-plus'} className={'itinerary-search-icon'}/>
        </div>
      </div>
    </div>


module.exports = AirportCollectLuggageLeg
