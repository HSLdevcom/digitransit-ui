React                 = require 'react'
Link                  = require 'react-router/lib/components/Link'
Icon                  = require '../icon/icon'
TopNavigation         = require './top-navigation'

class DefaultNavigation extends React.Component
  render: ->
    <div>
      <TopNavigation>
        <Link to="index">
          <Icon img={'icon-icon_arrow-left'} className="cursor-pointer back"/>
        </Link>
      </TopNavigation>
      <section ref="content" className="content">
        {@props.children}
      </section>
    </div>

module.exports = DefaultNavigation
