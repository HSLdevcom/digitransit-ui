React = require 'react'
cx    = require 'classnames'
Icon  = require '../icon/icon'
ComponentUsageExample = require '../documentation/component-usage-example'
Example               = require '../documentation/example-data'

RouteNumber = (props) ->
  mode = props.mode.toLowerCase()
  <span className={cx "route-number", props.className, {'vertical': props.vertical}} >
    <Icon className={mode} img={'icon-icon_' + mode} />
    {if props.vertical then <br/>}
    <span className={"vehicle-number " + mode}>{props.text}</span>
  </span>

RouteNumber.description =
  <div>
    <p>Display mode icon and route number with mode color</p>
    <ComponentUsageExample>
      <RouteNumber mode={Example.realtimeDeparture.pattern.route.type} text={Example.realtimeDeparture.pattern.route.shortName}/>
    </ComponentUsageExample>

    <ComponentUsageExample description="with realtime symbol">
      <RouteNumber mode={Example.realtimeDeparture.pattern.route.type} text={Example.realtimeDeparture.pattern.route.shortName} realtime={true}/>
    </ComponentUsageExample>

    <ComponentUsageExample description="in vertical configuration">
      <RouteNumber mode={Example.realtimeDeparture.pattern.route.type} text={Example.realtimeDeparture.pattern.route.shortName} vertical={true}/>
    </ComponentUsageExample>
  </div>

RouteNumber.propTypes =
  mode: React.PropTypes.string.isRequired
  realtime: React.PropTypes.bool
  text: React.PropTypes.string
  vertical: React.PropTypes.bool

RouteNumber.displayName = "RouteNumber"

module.exports = RouteNumber
