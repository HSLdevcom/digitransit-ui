React                 = require 'react'
Link                  = require 'react-router/lib/components/Link'
Icon                  = require '../icon/icon'

class BackButton extends React.Component
  @contextTypes:
    router: React.PropTypes.func

  # TODO
  # Transition back in next event loop
  # Without this mobile chrome might call back twice.
  # See: https://github.com/zilverline/react-tap-event-plugin/issues/14
  # This should be removed either when we change how pages are rendered or
  # When react-tap-plugin works better
  goBack: =>
    setTimeout(() =>
      if !@context.router.goBack() 
        @context.router.transitionTo("index")
    , 0)

  render: ->
    <div onTouchTap=@goBack className="cursor-pointer icon-holder">
      <Icon img={'icon-icon_arrow-left'} className="cursor-pointer back"/>
    </div>

module.exports = BackButton
