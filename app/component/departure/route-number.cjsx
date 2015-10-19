React = require 'react'
cx    = require 'classnames'
Icon  = require '../icon/icon'
ComponentUsageExample = require '../documentation/component-usage-example'
Example               = require '../documentation/example-data'

RouteNumber = (props) ->
  mode = props.mode.toLowerCase()
  <span className={cx "route-number", props.className} >
    <Icon className={mode} img={'icon-icon_' + mode}/>
    <span className={"vehicle-number " + mode}>{props.text}</span>
  </span>

RouteNumber.description =
  <div>
    <p>Display mode icon and route number with mode color</p>
    <ComponentUsageExample>
      <RouteNumber mode={Example.realtimeDeparture.pattern.route.type} text={Example.realtimeDeparture.pattern.route.shortName}/>
    </ComponentUsageExample>
  </div>

RouteNumber.propTypes =
  mode: React.PropTypes.string.isRequired
  text: React.PropTypes.string.isRequired

RouteNumber.displayName = "RouteNumber"

module.exports = RouteNumber
