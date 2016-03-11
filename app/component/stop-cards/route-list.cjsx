React                 = require 'react'
Icon                  = require '../icon/icon'
groupBy               = require 'lodash/groupBy'
uniq                  = require 'lodash/uniq'
routeCompare          = require '../../util/route-compare'
cx                    = require 'classnames'
RouteNumber           = require '../departure/route-number'

class RouteList extends React.Component
  render: ->
    routeObjs = []
    for mode, routes of groupBy(@props.routes, (route) -> route.type.toLowerCase())
      routeText = " " + uniq(
        route.shortName for route in routes.sort(routeCompare) when route.shortName
      ).join(', ')

      routeObjs.push  <div key={mode} className={mode}>
        <RouteNumber
          mode={mode}
          text={routeText}/>
      </div>

    <div className={cx 'route-list', @props.className}>
      {routeObjs}
    </div>


module.exports = RouteList
