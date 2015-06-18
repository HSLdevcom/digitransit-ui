React                 = require 'react'
Link                  = require 'react-router/lib/components/Link'
Icon                  = require '../icon/icon'
moment                = require 'moment'
Link                  = require 'react-router/lib/components/Link'

class RouteStop extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  render: ->
    vehicles = []
    if @props.vehicles
      date = moment().format("YYYYMMDD")
      for vehicle in @props.vehicles
        # We should probably inject the correct trip id earlies to the message and do the other fixups needed
        details =
          route: "HSL:" + vehicle.route
          date: date
          direction: parseInt(vehicle.dir)-1
          trip: vehicle.trip

        trip = @context.getStore('RouteInformationStore').getFuzzyTrip(details)
        if trip
          vehicles.push <Link to="trip" params={{tripId: trip.id}}>
              <Icon className={@props.mode} img={'icon-icon_' + @props.mode}/>
            </Link>
        else vehicles.push <Icon className={@props.mode} img={'icon-icon_' + @props.mode}/>

    <div className="route-stop row">
      <div className="columns small-3 route-stop-now">
        {@props.stop.now}
        {vehicles}
      </div>
      <Link to="stop" params={{stopId: @props.stop.id}}>
        <div className={"columns small-6 route-stop-name " + @props.mode}>
          {@props.stop.name}<br/>
            <span className="route-stop-address">
              {@props.stop.address}
            </span>
        </div>
        <div className="columns small-2 route-stop-code">
          {@props.stop.code}
        </div>
        <div className="columns small-1 route-stop-mins">
          {@props.stop.minutes}
       </div>
      </Link>
    </div>

module.exports = RouteStop