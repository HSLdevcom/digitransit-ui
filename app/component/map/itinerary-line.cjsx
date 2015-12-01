React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../../queries'
isBrowser          = window?
StopMarker         = require './stop/stop-marker'
LocationMarker     = require './location-marker'
Line               = require './line'
TripLine               = require './trip-line'
polyUtil           = require 'polyline-encoded'

class ItineraryLine extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired


  render: ->
    if not isBrowser
      return false

    objs = []

    if @props.showFromToMarkers
      if @context.getStore('EndpointStore').getOrigin().useCurrentPosition
        objs.push <LocationMarker map=@props.map
                                  key="from"
                                  position={@props.legs[0].from}
                                  className='from' />
      objs.push <LocationMarker map=@props.map
                                key="to"
                                position={@props.legs[@props.legs.length - 1].to}
                                className='to' />

    unless @props.passive
      itineraryStops = Array::concat.apply [], @props.legs.map (leg) ->
        leg.intermediateStops.concat [leg.from, leg.to]

    for leg, i in @props.legs
      if leg.mode == "WAIT"  # No sense trying to render a non-moving leg
        continue
      mode = leg.mode.toLowerCase() + if @props.passive then " passive" else ""

      objs.push <Line map={@props.map}
                      key={"#{@props.hash}_#{i}"}
                      geometry={polyUtil.decode leg.legGeometry.points}
                      mode={leg.mode.toLowerCase()}
                      passive={@props.passive}/>

      unless @props.passive
        if leg.tripId
          objs.push <Relay.RootContainer
            Component={TripLine}
            key={leg.tripId}
            route={new queries.TripRoute(id: leg.tripId)}
            renderLoading={() -> false}
            renderFetched={(data) =>
              <TripLine {... data} map={@props.map} filteredStops={itineraryStops}/>
            } />

        leg.intermediateStops?.forEach (stop) =>
          # Put subdued markers on intermediate stops
          # (actually all stops, but we draw over them next)
          objs.push <StopMarker map={@props.map}
                                stop={
                                  lat: stop.lat
                                  lon: stop.lon
                                  name: stop.name
                                  gtfsId: stop.stopId
                                  code: stop.stopCode
                                }
                                key="intermediate-#{stop.stopId}"
                                mode={mode}
                                thin=true />

        # Draw a more noticiable marker for the first stop
        # (where user changes vehicles/modes)
        objs.push <StopMarker map={@props.map}
                              key={i + "," + leg.mode + "marker"}
                              stop={
                                lat: leg.from.lat
                                lon: leg.from.lon
                                name: leg.from.name
                                gtfsId: leg.from.stopId
                                code: leg.from.stopCode
                              }
                              mode={mode}
                              renderText={leg.transitLeg and @props.showTransferLabels}/>

    <div style={{display: "none"}}>{objs}</div>

module.exports = ItineraryLine
