React                 = require 'react'
Icon                  = require '../icon/icon'
GtfsUtils             = require '../../util/gtfs'
Link                  = require 'react-router/lib/Link'


class RouteHeader extends React.Component
  render: =>
    mode = @props.route.type.toLowerCase()
    trip = if @props.trip then <span className="route-header-trip">{('0' + @props.trip.substring(0,2)).slice(-2)}:{('0' + @props.trip.substring(2,4)).slice(-2)} →</span> else ""
    headerText = if !@props.trip then <div className="route-header-name">{@props.route.longName}</div>
    if @props.reverseId && !@props.trip
      reverse = <Link to="#{process.env.ROOT_PATH}linjat/#{@props.reverseId}">
          <Icon className={"route-header-direction-switch " + mode} img={'icon-icon_direction-b'}/>
        </Link>

    <div className="route-header">
      <h1 className={mode}>
        <Icon img={'icon-icon_' + mode}/>
        {" " + (@props.route.shortName or "")}
        {trip}
      </h1>
      {headerText}
      <div className="route-header-direction">
        {if @props.pattern then (@props.pattern.stops[0].name + " ") else " "}
        <Icon className={mode} img={'icon-icon_arrow-right'}/>
        {if @props.pattern then (" " + @props.pattern.headsign) else " "}
        {reverse}
      </div>
      <span className="cursor-pointer favourite-icon" onClick={@props.addFavouriteRoute}>
        <Icon className={"favourite" + (if @props.favourite then " selected" else "")} img="icon-icon_star"/>
      </span>
    </div>

module.exports = RouteHeader
