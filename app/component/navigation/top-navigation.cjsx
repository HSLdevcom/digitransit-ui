React                 = require 'react'
Link                  = require 'react-router/lib/Link'
Icon                  = require '../icon/icon'
Config                = require '../../config'

class TopNavigation extends React.Component
  render: ->
    <nav className="top-bar">
      <section className="title">
        <Link to="/">
          <span className="title">{Config.title}</span>
        </Link>
      </section>
      {@props.children}
    </nav>


module.exports = TopNavigation
