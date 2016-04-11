React       = require 'react'
Icon        = require '../icon/icon'

SearchWithButton = (props) ->
  <div className="search-form">
    <div className="row upper-search-form">
      <div className="small-12 medium-6 medium-offset-3 columns search-form-map-overlay">
        <div className="row collapse postfix-radius">
          <div className="small-11 columns" >
            {props.searchField}
          </div>
          <div className="small-1 columns" onClick={props.onClick}>
            <span className="postfix search cursor-pointer button-icon">
              <Icon img={'icon-icon_search'}/>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

SearchWithButton.propTypes =
  from: React.PropTypes.node.isRequired
  to: React.PropTypes.node.isRequired
  onSwitch: React.PropTypes.func.isRequired
  routeIfPossible: React.PropTypes.func.isRequired

SearchWithButton.description = "Centered search field with search icon button"

SearchWithButton.displayName = "SearchWithButton"

module.exports = SearchWithButton
