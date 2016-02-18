React       = require 'react'
Icon        = require '../icon/icon'

SearchTwoFields = (props) ->
  <div className="search-form">
    <div className="row upper-search-form">
      <div className="small-12 medium-6 medium-offset-3 columns search-form-map-overlay">
        <div className="row collapse postfix-radius">
          <div className="small-11 columns" >
            {props.from}
          </div>
          <div className="small-1 columns">
            <span className="switch-from-to text-center search cursor-pointer button-icon" onClick={props.onSwitch}>
              <Icon img={'icon-icon_direction-a'}/>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div className="row">
      <div className="small-12 medium-6 medium-offset-3 columns search-form-map-overlay">
        <div className="row collapse postfix-radius">
          <div className="small-11 columns">
            {props.to}
          </div>
          <div className="small-1 columns">
            <span className="postfix search cursor-pointer button-icon" onClick={props.routeIfPossible}>
              <Icon img={'icon-icon_search'}/>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

SearchTwoFields.propTypes =
  from: React.PropTypes.node.isRequired
  to: React.PropTypes.node.isRequired
  onSwitch: React.PropTypes.func.isRequired
  routeIfPossible: React.PropTypes.func.isRequired

SearchTwoFields.description = "Search boxes for to and from values that can be used over a map"

SearchTwoFields.displayName = "SearchTwoFields"

module.exports = SearchTwoFields
