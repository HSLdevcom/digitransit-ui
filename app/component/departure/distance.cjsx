React = require 'react'
ComponentUsageExample = require '../documentation/component-usage-example'

Distance = (props) ->
  <span className="distance">{(props.distance // 10) * 10 + "m"}</span>

Distance.description =
  <div>
    <p>Display distance in correct format. Rounds to 10s of meters.</p>
    <ComponentUsageExample description="distance">
      <Distance distance={123}/>
    </ComponentUsageExample>
  </div>


Distance.propTypes =
  distance: React.PropTypes.number.isRequired

Distance.displayName = "Distance"

module.exports = Distance
