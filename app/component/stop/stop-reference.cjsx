React = require 'react'
cx    = require 'classnames'

StopReference = (props) ->
  mode = props.mode.toLowerCase()
  <span className={cx "stop-reference", mode, props.className} >
    {props.code}
  </span>

StopReference.description = "Display stop number / platform number, Text color depends on mode."

StopReference.propTypes =
  mode: React.PropTypes.string.isRequired
  code: React.PropTypes.string.isRequired

StopReference.displayName = "StopReference"

module.exports = StopReference
