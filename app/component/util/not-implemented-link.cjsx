React                = require 'react'
Modal                = require './modal'
NotImplementedAction = require('../../action/not-implemented-action')
FormattedMessage     = require('react-intl').FormattedMessage

class NotImplementedLink extends React.Component

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired


  notImplemented: =>
    context.executeAction NotImplementedAction.click, {name: @props.name}

  render: ->
    <a href="#" onClick={@notImplemented}>{@props.name}
     {@props.children}
    </a>

module.exports = NotImplementedLink
