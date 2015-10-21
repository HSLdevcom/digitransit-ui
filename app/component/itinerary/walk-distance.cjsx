React = require 'react'
Icon  = require '../icon/icon'
cx    = require 'classnames'

WalkDistance = (props) ->

  <span className={cx props.className}>
    <Icon img={'icon-icon_walk'}/>
    <span className="walk-distance">&nbsp;{Math.round(props.walkDistance/100)*100}m</span>
  </span>

WalkDistance.description =
  "Displays the total walk distance of the itinerary in precision of 10 meters.
   Requires walkDistance in meters as props"

WalkDistance.propTypes =
  walkDistance: React.PropTypes.number.isRequired

WalkDistance.displayName = "WalkDistance"

module.exports = WalkDistance
