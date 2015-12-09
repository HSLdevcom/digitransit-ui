React = require 'react'
Icon  = require '../icon/icon'
ArrowLink = require '../util/arrow-link'
NotImplementedAction   = require '../../action/not-implemented-action'


intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class BottomNavigation extends React.Component
  navigate: ->
    @context.executeAction NotImplementedAction.click, name: <FormattedMessage id='navigate' defaultMessage='Navigate' />
    false

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
        <a href="#" onClick={@navigate}>
          <Icon img={'icon-icon_arrow-right'} className="itinerary-bottom-navigation__icon right-arrow-blue-background"/>
          <FormattedMessage id='navigate' defaultMessage='Navigate' />
        </a>
      </div>
    </div>


module.exports = BottomNavigation
