React                 = require 'react'
Icon                  = require '../icon/icon'

class RouteHeader extends React.Component
  @typeToName =
    0: 'tram'
    1: 'subway'
    2: 'rail'
    3: 'bus'
    4: 'ferry'
    109: 'rail'


  render: =>
    mode = RouteHeader.typeToName[@props.route.type]

    <div className="route-header">
      <h1 className={mode}>
        <Icon img={'icon-icon_' + mode}/>
        &nbsp;{@props.route.shortName}
      </h1>
      <div className="route-header-name">{@props.route.longName}</div>
      <div className="route-header-direction">{@props.pattern.stops[0].name} <Icon className={mode} img={'icon-icon_arrow-right'}/> {@props.pattern.trips[0].tripHeadsign}</div>
    </div>

module.exports = RouteHeader