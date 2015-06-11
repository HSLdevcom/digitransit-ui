React                 = require 'react'
RouteStop             = require './route-stop'
GtfsUtils             = require '../../util/gtfs'

class RouteStopListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: -> 
    @context.getStore('RouteInformationStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('RouteInformationStore').removeChangeListener @onChange

  onChange: (id) =>
    if !id or id == @props.id or id == @props.id.split(':',2).join(':')
      @forceUpdate()
  
  getStops: (id) =>
    stops = @context.getStore('RouteInformationStore').getPattern(id).stops
    mode = GtfsUtils.typeToName[@context.getStore('RouteInformationStore').getRoute(@props.id.split(':',2).join(':')).type]

    stopObjs = []

    stopObjs.push <div className="route-stop row">
      <div className="columns small-3 route-stop-now">
        Juuri Nyt
      </div>
      <div className="columns small-6 route-stop-name ">
        Pysäkki
      </div>
      <div className="columns small-2 route-stop-code">
        Pysäkkinumero
      </div>
      <div className="columns small-1 route-stop-mins">
        Min
      </div>
    </div>

    stops.forEach (stop) ->
      stopObjs.push <RouteStop key={stop.id} stop={stop} mode={mode}/>

    stopObjs

  render: =>
    <div className="route-stop-list">
      {@getStops(@props.id)}
    </div>

module.exports = RouteStopListContainer