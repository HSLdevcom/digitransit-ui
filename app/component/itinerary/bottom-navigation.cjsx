React = require 'react'
Icon  = require '../icon/icon'
Link  = require('react-router/lib/Link').Link


class BottomNavigation extends React.Component

  render: ->
    <div className="itinerary-bottom-navigation row">
      <div className="small-4 columns">
        <Icon img={'icon-icon_share'}/> Jaa Ohje
      </div>
      <div className="small-4 columns">
        <Icon img={'icon-icon_print'}/> Tulosta
      </div>
      <div className="small-4 columns navigate">
        <Link to="#{process.env.ROOT_PATH}reitti/#{@props.params.from}/#{@props.params.to}/#{@props.params.hash}/navigoi">
         <Icon img={'icon-icon_arrow-right'}/> Navigoi
        </Link>
      </div>
    </div>

module.exports = BottomNavigation
