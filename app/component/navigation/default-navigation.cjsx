React                 = require 'react'
Link                  = require 'react-router/lib/components/Link'
Icon                  = require '../icon/icon'
TopNavigation         = require './top-navigation'

class DefaultNavigation extends React.Component
  @contextTypes:
    router: React.PropTypes.func

  goBack: =>
    if !@context.router.goBack()
      @context.router.transitionTo("index")

  render: ->
    <div className={@props.className}>
      <TopNavigation>
        <div onClick=@goBack>
          <Icon img={'icon-icon_arrow-left'} className="cursor-pointer back"/>
        </div>
      </TopNavigation>
      <section ref="content" className="content">
        {@props.children}
      </section>
    </div>

module.exports = DefaultNavigation
