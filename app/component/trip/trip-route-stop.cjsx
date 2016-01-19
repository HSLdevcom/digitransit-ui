React           = require 'react'
Link            = require 'react-router/lib/Link'
Icon            = require '../icon/icon'
moment          = require 'moment'
cx              = require 'classnames'
WalkDistance    = require '../itinerary/walk-distance'

class TripRouteStop extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  renderTime: (realtimeDeparture, currentTimeFromMidnight, realtime) ->
    # times are given in minutes since midnight
    departureTime = @context.getStore('TimeStore').getCurrentTime().startOf('day').second(realtimeDeparture)
    return (moment(departureTime).format "HH:mm")
    # TODO: display real-time estimation to the stop

  render: ->
    vehicles = []
    if @props.vehicle
      vehicles.push <Icon id="now"
                          key={@props.vehicle.id}
                          className={cx @props.mode, 'large-icon'}
                          img={"icon-icon_#{@props.mode}-live"}
        />

    stopPassed =
      passed: !@props.stopPassed

    <div className={cx "route-stop row", stopPassed}>
      <div className="columns small-3 route-stop-time">
        {@renderTime(@props.realtimeDeparture, @props.currentTimeFromMidnight, @props.realtime)}
        <div className="route-stop-now-icon">
          {vehicles}
        </div>
      </div>

      <Link to="/pysakit/#{@props.stop.gtfsId}">
        <div className={"columns small-7 route-stop-name " + @props.mode}>
          {@props.stop.name}{"\u00a0"}
          {if @props.distance then <WalkDistance className="nearest-route-stop"
                                                 icon="icon_location_with_user"
                                                 walkDistance={@props.distance}/>}
          <br/>
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
