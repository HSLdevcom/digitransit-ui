React                 = require 'react'
Icon                  = require '../icon/icon.cjsx'
groupBy               = require 'lodash/collection/groupBy'
uniq                  = require 'lodash/array/uniq'
routeCompare          = require '../../util/route-compare'
cx                    = require 'classnames'

class RouteList extends React.Component
  render: ->
    routeObjs = []
    for mode, routes of groupBy(@props.routes, (route) -> route.type.toLowerCase())
      routeObjs.push <div key={mode} className={mode}><Icon img={'icon-icon_' + mode} />
        {" " + uniq(routes.sort(routeCompare).map((route) -> route.shortName)).join(', ')}
      </div>

    <div className={cx 'route-list', @props.className}>
      {routeObjs}
    </div>

module.exports = RouteList
