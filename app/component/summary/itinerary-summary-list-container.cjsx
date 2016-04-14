React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
ItinerarySummary      = require '../itinerary/itinerary-summary'
SummaryRow            = require './summary-row'
Icon                  = require '../icon/icon'

class ItinerarySummaryListContainer extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  render: =>
    summaries = []
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

module.exports = Relay.createContainer ItinerarySummaryListContainer,
  fragments: queries.ItinerarySummaryListContainerFragments
