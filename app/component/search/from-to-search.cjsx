React = require 'react'
Icon  = require '../icon/icon'
Link  = require 'react-router/lib/components/Link'

class FromToSearch extends React.Component
  render: ->
    <div className="search-form">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              <input type="text" disabled value={@props.params.from.split("::")[0]}/>
            </div>
            <Link to="itineraryList" params={{to: @props.params.from, from: @props.params.to}} className="small-1 columns">
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
      <Icon img={'icon-icon_direction-a'} className="cursor-pointer"/>
    </div>

module.exports = FromToSearch