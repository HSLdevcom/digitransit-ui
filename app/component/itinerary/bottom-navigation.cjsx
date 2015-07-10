React = require 'react'
Icon  = require '../icon/icon'
Link  = require 'react-router/lib/components/Link'


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
        <Link to="navigate" params={{from: @props.params.from, to:@props.params.to, hash:@props.params.hash}}>
         <Icon img={'icon-icon_arrow-right'}/> Navigoi
        </Link>
      </div>
    </div>

module.exports = BottomNavigation
