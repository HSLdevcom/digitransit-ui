React                 = require 'react'
Link                  = require 'react-router/lib/components/Link'
Icon                  = require '../icon/icon'
Config                = require '../../config'

class TopNavigation extends React.Component
  render: ->
    <div className="fixed">
      <nav className="top-bar">
        <section className="title">
          <Link to="index">
            <span className="title">{Config.title}</span>
          </Link>
        </section>
        {@props.children}
      </nav>
    </div>

module.exports = TopNavigation
