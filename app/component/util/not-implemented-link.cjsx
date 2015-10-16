React                = require 'react'
Modal                = require './modal'
NotImplementedAction = require('../../action/not-implemented-action')
FormattedMessage     = require('react-intl').FormattedMessage
ComponentUsageExample = require '../documentation/component-usage-example'
class NotImplementedLink extends React.Component

  @description:
    <div>
      <p>
        Builds a link that opens a 'not implemented' popup.
      </p>
      <p>
        The 'not implemented' -popup can also be activated by sending a event through
        not-implemented-action#click
      </p>
      <ComponentUsageExample>
        <NotImplementedLink name="The promiseware">Promiseware</NotImplementedLink>
      </ComponentUsageExample>
    </div>


  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  @propTypes:
    name: React.PropTypes.node

  notImplemented: =>
    context.executeAction NotImplementedAction.click, {name: @props.name}
    return false

  render: ->
    <a href="#" onClick={@notImplemented}>
     {@props.children}
    </a>

module.exports = NotImplementedLink
