React = require 'react'
Icon  = require '../icon/icon'
Link  = require('react-router/lib/Link').Link

intl = require('react-intl')
FormattedMessage = intl.FormattedMessage

class BottomNavigation extends React.Component

  render: ->
    <div className="itinerary-bottom-navigation row">
      <div className="small-4 columns">
        <Icon img={'icon-icon_share'}/><FormattedMessage id='share'
                                                         defaultMessage='Share' />
      </div>
      <div className="small-4 columns">
        <Icon img={'icon-icon_print'}/><FormattedMessage id='print'
                                                         defaultMessage='Print' />
      </div>
      <div className="small-4 columns navigate">
        <Link to="#{process.env.ROOT_PATH}reitti/#{@props.params.from}/#{@props.params.to}/#{@props.params.hash}/navigoi">
         <Icon img={'icon-icon_arrow-right'}/>
           <FormattedMessage id='navigate' defaultMessage='Navigate' />
        </Link>
      </div>
    </div>

module.exports = BottomNavigation
