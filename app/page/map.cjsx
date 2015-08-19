React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
SearchWithLocation = require '../component/search/search-with-location.cjsx'
Icon               = require '../component/icon/icon'
Map                = require '../component/map/map'
Link               = require('react-router/lib/Link').Link


class Page extends React.Component
  render: ->
    <DefaultNavigation className="fullscreen">
      <Map className="fullscreen" showStops=true showVehicles=true>
        <SearchWithLocation/>
        <Link to={process.env.ROOT_PATH}><div className="fullscreen-toggle"><Icon img={'icon-icon_minimize'} className="cursor-pointer" /></div></Link>
      </Map>
    </DefaultNavigation>

module.exports = Page
