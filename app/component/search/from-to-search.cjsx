React = require 'react'
Icon  = require '../icon/icon'
Link  = require('react-router/lib/Link').Link

class FromToSearch extends React.Component
  render: ->
    <div className="search-form">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              <input type="text" disabled value={@props.params.from.split("::")[0]}/>
            </div>
            <Link to="#{process.env.ROOT_PATH}reitti/#{@props.params.to}/#{@props.params.from}" className="small-1 columns">
              <span className="postfix search">
                <Icon img={'icon-icon_direction-a'}/>
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              <input type="text" disabled value={@props.params.to.split("::")[0]}/>
            </div>
            <div className="small-1 columns">
              <span className="postfix search">
                <Icon img={'icon-icon_search'}/>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

module.exports = FromToSearch
