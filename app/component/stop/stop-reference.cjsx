React = require 'react'
cx    = require 'classnames'
ComponentUsageExample = require('../documentation/ComponentUsageExample').default
Example = require '../documentation/ExampleData'

StopReference = (props) ->
  mode = props.mode.toLowerCase()
  <span className={cx "stop-reference", mode, props.className} >
    {props.code}
  </span>

StopReference.description =
  <div>
    <p>Display stop number / platform number, Text color depends on mode.</p>
    <ComponentUsageExample>
      <StopReference mode={Example.realtimeDeparture.pattern.route.type} code={Example.realtimeDeparture.stop.code}/>
    </ComponentUsageExample>
  </div>

StopReference.propTypes =
  mode: React.PropTypes.string.isRequired
  code: React.PropTypes.string.isRequired

StopReference.displayName = "StopReference"

module.exports = StopReference
