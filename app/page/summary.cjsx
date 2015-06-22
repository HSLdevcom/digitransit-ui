React              = require 'react'
SummaryNavigation  = require '../component/navigation/summary-navigation'
Map                = require '../component/map/map'
ItinerarySearchActions = require '../action/itinerary-search-action'
SummaryRow         = require '../component/summary/summary-row'
FromToSearch       = require '../component/search/from-to-search'
ItineraryLine      = require '../component/map/itinerary-line'
sortBy             = require 'lodash/collection/sortBy'

class SummaryPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  @loadAction: ItinerarySearchActions.itinerarySearchRequest

  componentDidMount: ->
    @context.getStore('ItinerarySearchStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('ItinerarySearchStore').removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  onSelectActive: (index) =>
    @setState
      activeIndex: index

  render: ->
    rows = []
    leafletObjs = [] 
    activeIndex = if @state and @state.activeIndex then @state.activeIndex else 0

    plan = @context.getStore('ItinerarySearchStore').getData().plan

    if plan
      for data, i in plan.itineraries
        passive = i != activeIndex
        rows.push <SummaryRow key={i} hash={i} params={@props.params} data={data} passive={passive} onSelect={@onSelectActive}/>
        leafletObjs.push <ItineraryLine key={i} legs={data.legs} showFromToMarkers={i==0} passive={passive}/>

    # Draw active last
    leafletObjs = sortBy(leafletObjs, (i) => i.props.passive == false)

    <SummaryNavigation className="fullscreen">
      <Map ref="map" className="summaryMap" leafletObjs={leafletObjs} fitBounds={true} from={plan.from} to={plan.to} padding={[0, 110]}>
        <FromToSearch params={@props.params}/>
      </Map>
      <div>{rows}</div>
    </SummaryNavigation>

module.exports = SummaryPage