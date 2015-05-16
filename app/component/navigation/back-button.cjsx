React                 = require 'react'
Link                  = require 'react-router/lib/components/Link'
Icon                  = require '../icon/icon'

class BackButton extends React.Component
  @contextTypes:
    router: React.PropTypes.func

  goBack: =>
    if !@context.router.goBack()
      @context.router.transitionTo("index")

  render: ->
    <div onClick=@goBack>
      <Icon img={'icon-icon_arrow-left'} className="cursor-pointer back"/>
    </div>

module.exports = BackButton
