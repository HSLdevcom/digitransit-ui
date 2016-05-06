React       = require 'react'
Icon        = require '../icon/icon'

FakeSearchWithButton = (props) ->
  <div className="row search-form">
    <div className="small-12 medium-6 medium-offset-3 columns search-form-map-overlay">
      <div className="row collapse postfix-radius">
        <div className="small-11 columns" >
          {props.fakeSearchBar}
        </div>
        <div className="small-1 columns" onClick={props.onClick}>
          <span className="postfix search cursor-pointer button-icon">
            <Icon img='icon-icon_search'/>
          </span>
        </div>
      </div>
    </div>
  </div>

FakeSearchWithButton.propTypes =
  fakeSearchBar: React.PropTypes.object.isRequired
  onClick: React.PropTypes.func

FakeSearchWithButton.description = "Centered fake search field with search icon button"

FakeSearchWithButton.displayName = "FakeSearchWithButton"

module.exports = FakeSearchWithButton
