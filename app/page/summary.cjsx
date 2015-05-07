React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
Map                = require '../component/map/map'
RouteSearchActions = require '../action/route-search-action'
SummaryRow         = require '../component/summary/summary-row'

class SummaryPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: -> 
    @context.getStore('RouteSearchStore').addChangeListener @onChange
    options = 
      fromPlace: @props.params.from
      toPlace: @props.params.to
      preferredAgencies: "HSL"
    @context.executeAction RouteSearchActions.routeSearchRequest, options

  componentWillUnmount: ->
    @context.getStore('RouteSearchStore').removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  render: ->
    rows = []
    if @context.getStore('RouteSearchStore').getData().plan
      for data, i in @context.getStore('RouteSearchStore').getData().plan.itineraries
        rows.push <SummaryRow key={i} data={data}/> 

    <DefaultNavigation className="fullscreen">
      <Map><div style={{position: 'absolute'}}>{@props.params.from} {@props.params.to}</div></Map>
      <div>{rows}</div>
    </DefaultNavigation>

module.exports = SummaryPage