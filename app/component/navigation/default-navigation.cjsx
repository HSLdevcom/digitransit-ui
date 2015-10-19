React                 = require 'react'
TopNavigation         = require './top-navigation'
BackButton            = require './back-button'
NotImplemented        = require '../util/not-implemented'

class DefaultNavigation extends React.Component
  render: ->
    <div className={@props.className}>
      <TopNavigation>
        <BackButton/>
      </TopNavigation>
      <section ref="content" className="content">
        {@props.children}
      </section>
      <NotImplemented/>
    </div>

module.exports = DefaultNavigation
