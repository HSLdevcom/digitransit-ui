React                 = require 'react'
Icon                  = require '../icon/icon'
GtfsUtils             = require '../../util/gtfs'

class RouteHeader extends React.Component
  render: =>
    mode = GtfsUtils.typeToName[@props.route.type]

    <div className="route-header">
      <h1 className={mode}>
        <Icon img={'icon-icon_' + mode}/>
        &nbsp;{@props.route.shortName}
      </h1>
      <div className="route-header-name">{@props.route.longName}</div>
      <div className="route-header-direction">
        {@props.pattern.stops[0].name}&nbsp;
        <Icon className={mode} img={'icon-icon_arrow-right'}/>&nbsp;
        {@props.pattern.trips[0].tripHeadsign}
        <Icon className={"route-header-direction-switch " + mode} img={'icon-icon_direction-b'}/>
      </div>
    </div>

module.exports = RouteHeader