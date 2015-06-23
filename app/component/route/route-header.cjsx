React                 = require 'react'
Icon                  = require '../icon/icon'
GtfsUtils             = require '../../util/gtfs'
Link                  = require 'react-router/lib/components/Link'


class RouteHeader extends React.Component
  render: =>
    unless @props.route
      return <div className="route-header"/>
    mode = GtfsUtils.typeToName[@props.route.type]
    trip = if @props.trip then <span className="route-header-trip">{@props.trip.substring(0,2)}:{@props.trip.substring(2,4)} →</span> else ""
    if @props.reverseId
      reverse = <Link to="route" params={{routeId: @props.reverseId}}>
          <Icon className={"route-header-direction-switch " + mode} img={'icon-icon_direction-b'}/>
        </Link>

    <div className="route-header">
      <h1 className={mode}>
        <Icon img={'icon-icon_' + mode}/>
        {" " + @props.route.shortName}
        {trip}
      </h1>
      <div className="route-header-name">{@props.route.longName}</div>
      <div className="route-header-direction">
        {if @props.pattern then (@props.pattern.stops[0].name + " ") else " "}
        <Icon className={mode} img={'icon-icon_arrow-right'}/>
        {if @props.pattern then (" " + @props.pattern.trips[0].tripHeadsign) else " "}
        {reverse}
      </div>
      <span className="cursor-pointer favourite-icon" onClick={@props.addFavouriteRoute}>
        <Icon className={"favourite" + (if @props.favourite then " selected" else "")} img="icon-icon_star"/>
      </span>
    </div>

module.exports = RouteHeader