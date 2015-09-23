React           = require 'react'
Link            = require 'react-router/lib/Link'
Icon            = require '../icon/icon'
classnames      = require 'classnames'
TripLink              = require '../trip/trip-link'

class TripRouteStop extends React.Component
  # TODO: get the time to the following stops
  getTimeToStop: ->

  render: ->
    vehicles = []
    if @props.vehicles
      for vehicle in @props.vehicles
        vehicles.push <Icon id="now" key={vehicle.id} className={@props.mode} img={'icon-icon_' + @props.mode}/>

    stopPassed =
      passed: !@props.stopPassed

    <div className={classnames "route-stop row", stopPassed}>
      <div className="columns small-3 route-stop-time">
        {@getTimeToStop()}
        <div className="route-stop-now-icon">
          {vehicles}
        </div>
      </div>

      <Link to="#{process.env.ROOT_PATH}pysakit/#{@props.stop.gtfsId}">
        <div className={"columns small-7 route-stop-name " + @props.mode}>
          {@props.stop.name}<br/>
          <span className="route-stop-address">
            {@props.stop.desc}
          </span>
        </div>
        <div className="columns small-2 route-stop-code">
          {@props.stop.code}
        </div>
      </Link>
    </div>

module.exports = TripRouteStop
