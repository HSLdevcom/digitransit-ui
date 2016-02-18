React       = require 'react'
Icon        = require '../icon/icon.cjsx'
cx          = require 'classnames'
ComponentUsageExample = require '../documentation/component-usage-example'
Example = require '../documentation/example-data'

RouteDestination = (props) ->
  mode = props.mode.toLowerCase()
  <span className={cx "route-destination", props.className} >
    <span className="destination">{props.destination}</span>
  </span>

RouteDestination.description =
  <div>
    <p>Display the destination of the route (headsign)</p>
    <ComponentUsageExample>
      <RouteDestination mode={Example.realtimeDeparture.pattern.route.type} destination={Example.realtimeDeparture.pattern.headsign or Example.realtimeDeparture.pattern.route.longName}/>
    </ComponentUsageExample>
  </div>


RouteDestination.propTypes =
  mode: React.PropTypes.string.isRequired
  destination: React.PropTypes.string.isRequired

RouteDestination.displayName = "RouteDestination"

module.exports = RouteDestination
