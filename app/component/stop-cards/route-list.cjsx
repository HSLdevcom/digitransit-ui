React                 = require 'react'
Icon                  = require '../icon/icon.cjsx'
Link                  = require 'react-router/lib/components/Link'
groupBy               = require 'lodash/collection/groupBy'

class RouteList extends React.Component
  render: ->
    routeObjs = []
    for k, v of groupBy(@props.routes, (r) -> r.mode.toLowerCase())
      routeObjs.push <div key={k} className={k}><Icon img={'icon-icon_' + k} />
      	  {" " + route.shortName for route in v when route.shortName}
      	</div>

    <div className="route-list">
      {routeObjs}
    </div>

module.exports = RouteList