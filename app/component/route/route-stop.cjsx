React                 = require 'react'
Link                  = require 'react-router/lib/components/Link'
Icon                  = require '../icon/icon'

class RouteStop extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  render: ->
    vehicles = []
    if @props.vehicles
      for vehicle in @props.vehicles
        if vehicle.trip
          vehicles.push <Link key={vehicle.id} to="trip" params={{tripId: vehicle.trip.id}}>
              <Icon className={vehicle.mode} img={'icon-icon_' + vehicle.mode}/>
            </Link>
        else vehicles.push <Icon key={vehicle.id} className={@props.mode} img={'icon-icon_' + @props.mode}/>

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
