React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
Map                = require '../component/map/map'

Page = React.createClass
  render: ->
    <DefaultNavigation className="fullscreen">
      <Map fullscreen={true}/>
    </DefaultNavigation>

module.exports = Page