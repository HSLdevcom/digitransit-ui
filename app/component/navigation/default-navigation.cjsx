React                 = require 'react'
Link                  = require 'react-router/lib/components/Link'
Icon                  = require '../icon/icon'
TopNavigation         = require './top-navigation'
BackButton            = require './back-button'

class DefaultNavigation extends React.Component
  render: ->
    <div className={@props.className}>
      <TopNavigation>
        <BackButton/>
      </TopNavigation>
      <section ref="content" className="content">
        {@props.children}
      </section>
    </div>

module.exports = DefaultNavigation
