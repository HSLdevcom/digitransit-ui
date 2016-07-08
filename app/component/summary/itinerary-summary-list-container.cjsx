React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
ItinerarySummary      = require '../itinerary/itinerary-summary'
SummaryRow            = require('./SummaryRow').default
Icon                  = require '../icon/icon'
FormattedMessage      = require('react-intl').FormattedMessage

class ItinerarySummaryListContainer extends React.Component
  render: =>
    summaries = []
    if @props.itineraries and @props.itineraries.length > 0
      for itinerary, i in @props.itineraries
        passive = i != @props.activeIndex
        summaries.push <SummaryRow
          key={i}
          hash={i}
          params={@props.params}
          data={itinerary}
          passive={passive}
          currentTime={@props.currentTime}
          onSelect={@props.onSelect}
        />
      <div>{summaries}</div>
    else
      <div className="summary-no-route-found">
        <FormattedMessage
          id={'no-route-msg'}
          defaultMessage="Unfortunately no route was found between the locations you gave. Please change origin and/or destination address."
        />
      </div>


module.exports = Relay.createContainer ItinerarySummaryListContainer,
  fragments: queries.ItinerarySummaryListContainerFragments
