React = require 'react'
ComponentUsageExample = require('../documentation/ComponentUsageExample').default

Distance = (props) ->
  if props.distance
    roundedDistanceInM = (props.distance - props.distance % 10)
    roundedDistanceInKm = ((props.distance - props.distance % 100) / 1000).toFixed(1)
  if !props.distance
    distance = ""
  else if roundedDistanceInM < 1000
    distance = roundedDistanceInM + "m"
  else
    distance = roundedDistanceInKm + "km"
  <span className="distance">{distance}</span>

Distance.description =
  <div>
    <p>Display distance in correct format. Rounds to 10s of meters or if above 1000 then shows kilometers with one decimal.</p>
    <ComponentUsageExample description="distance is rounded down">
      <Distance distance={7}/>
    </ComponentUsageExample>
    <ComponentUsageExample description="distance">
      <Distance distance={123}/>
    </ComponentUsageExample>
    <ComponentUsageExample description="distance in km">
      <Distance distance={3040}/>
    </ComponentUsageExample>
  </div>


Distance.propTypes =
  distance: React.PropTypes.number.isRequired

Distance.displayName = "Distance"

module.exports = Distance
