React = require 'react'
Icon  = require '../icon/icon'
Link  = require 'react-router/lib/Link'
ArrowLink = require '../util/arrow-link'

intl = require 'react-intl'
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
        <ArrowLink to="/reitti/#{@props.params.from}/#{@props.params.to}/#{@props.params.hash}/navigoi"
                   className="itinerary-bottom-navigation__icon right-arrow-blue-background">
          <FormattedMessage id='navigate' defaultMessage='Navigate' />
        </ArrowLink>
      </div>
    </div>

module.exports = BottomNavigation
