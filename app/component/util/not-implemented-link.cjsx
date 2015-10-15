React                = require 'react'
Modal                = require './modal'
NotImplementedAction = require('../../action/not-implemented-action')
FormattedMessage     = require('react-intl').FormattedMessage

class NotImplementedLink extends React.Component

  @description:
    "
    Builds a link that opens a 'not implemented' popup.

    The 'not implemented' -popup can also be activated by sending a event through
    not-implemented-action#click
    "

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  @propTypes:
    name: React.PropTypes.string

  notImplemented: =>
    context.executeAction NotImplementedAction.click, {name: @props.name}

  render: ->
    <a href="#" onClick={@notImplemented}>
     {@props.children}
    </a>

module.exports = NotImplementedLink
