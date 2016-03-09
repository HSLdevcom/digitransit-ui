React  = require 'react'
moment = require 'moment'
config = require '../../config'
Icon   = require '../icon/icon'
intl   = require('react-intl')
FormattedMessage = intl.FormattedMessage

class EndLeg extends React.Component

  render: ->
    <div key={@props.index} style={{width: "100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.endTime).format('HH:mm')}
        </div>
      </div>
      <div onClick={@props.focusAction} className="small-10 columns itinerary-instruction-column to">
        <div>
          <Icon img={'icon-icon_mapMarker-point'} className="itinerary-icon to"/>
        </div>
        <div className="itinerary-leg-first-row">
          <FormattedMessage
            id='end-journey'
            defaultMessage='End journey at' />
          <Icon img={'icon-icon_search-plus'} className={'itinerary-search-icon'}/>
        </div>
        {if config.itinerary.showEndLegDestination
          <div>{@props.to}</div>}
      </div>
    </div>


module.exports = EndLeg
