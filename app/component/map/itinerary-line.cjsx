React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../../queries'
isBrowser          = window?
StopMarker         = require './stop-marker'
LocationMarker     = require './location-marker'
Line               = require './line'
TripLine               = require './trip-line'
polyUtil           = require 'polyline-encoded'
cx                 = require 'classnames'

class ItineraryLine extends React.Component
  render: ->
    if not isBrowser
      return false

    objs = []

    if @props.showFromToMarkers
      #TODO: refactor FromToMarkers into own file, used also in RouteLine
      objs.push <LocationMarker map=@props.map
                                key="from"
                                position={@props.legs[0].from}
                                class='from' />
      objs.push <LocationMarker map=@props.map
                                key="to"
                                position={@props.legs[@props.legs.length - 1].to}
                                class='to' />

    itineraryStops = Array::concat.apply [], @props.legs.map (leg) ->
      leg.intermediateStops.concat [leg.from, leg.to]

    for leg, i in @props.legs
      mode = if @props.passive then "passive" else leg.mode.toLowerCase()

      objs.push <Line map={@props.map}
                      key={i + leg.mode + @props.passive}
                      geometry={polyUtil.decode leg.legGeometry.points}
                      mode={mode} />

      unless @props.passive
        if leg.tripId
          objs.push <Relay.RootContainer
            Component={TripLine}
            key={leg.agencyId + ":" + leg.tripId}
            route={new queries.TripRoute(id: leg.agencyId + ":" + leg.tripId)}
            renderLoading={() -> false}
            renderFetched={(data) =>
              <TripLine map={@props.map} pattern={data.pattern} filteredStops={itineraryStops}/>
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
