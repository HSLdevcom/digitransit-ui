React                 = require 'react'
Icon                  = require '../icon/icon'
GtfsUtils             = require '../../util/gtfs'
Link                  = require 'react-router/lib/components/Link'


class RouteHeader extends React.Component
  render: =>
    mode = GtfsUtils.typeToName[@props.route.type]
    trip = if @props.trip then <span className="route-header-trip">{@props.trip.substring(0,2)}:{@props.trip.substring(2,4)} →</span> else ""
    reverseId = "#{@props.route.id}:#{if @props.pattern.id.split(':')[2] == '1' then '0' else '1'}:01"

    <div className="route-header">
      <h1 className={mode}>
        <Icon img={'icon-icon_' + mode}/>
        &nbsp;{@props.route.shortName}
        {trip}
      </h1>
      <div className="route-header-name">{@props.route.longName}</div>
      <div className="route-header-direction">
        {@props.pattern.stops[0].name}&nbsp;
        <Icon className={mode} img={'icon-icon_arrow-right'}/>&nbsp;
        {@props.pattern.trips[0].tripHeadsign}
        <Link to="route" params={{routeId: reverseId}}>
          <Icon className={"route-header-direction-switch " + mode} img={'icon-icon_direction-b'}/>
        </Link>
      </div>
    </div>

module.exports = RouteHeader