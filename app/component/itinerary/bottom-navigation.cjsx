React = require 'react'
Icon  = require '../icon/icon'
NotImplementedAction   = require '../../action/not-implemented-action'


intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class BottomNavigation extends React.Component
  navigate: ->
    @context.executeAction NotImplementedAction.click, <FormattedMessage id='navigate' defaultMessage='Navigate' />
    false

  render: ->
    <div className="itinerary-bottom-navigation row">
      <div className="small-6 columns">
        <Icon img={'icon-icon_share'}/><FormattedMessage id='share'
                                                         defaultMessage='Share' />
      </div>
      <div className="small-6 columns noborder">
        <Icon img={'icon-icon_print'}/><FormattedMessage id='print'
                                                         defaultMessage='Print' />
      </div>
    </div>


module.exports = BottomNavigation
