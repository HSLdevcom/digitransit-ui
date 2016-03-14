React = require 'react'

StopCode = (props) ->

  <span className="itinerary-stop-code">{props.code}</span>

StopCode.displayName = "StopCode"

StopCode.propTypes = React.PropTypes.string.isRequired

module.exports = StopCode
