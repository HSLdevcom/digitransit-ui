React                 = require 'react'
Icon                  = require '../icon/icon.cjsx'
groupBy               = require 'lodash/collection/groupBy'

class RouteList extends React.Component
  render: ->
    routeObjs = []
    for mode, routes of groupBy(@props.routes, (route) -> route.type.toLowerCase())
      routeObjs.push <div key={mode} className={mode}><Icon img={'icon-icon_' + mode} />
      	  {" " + route.shortName for route in routes when route.shortName}
      	</div>

    <div className="route-list">
      {routeObjs}
    </div>

module.exports = RouteList
