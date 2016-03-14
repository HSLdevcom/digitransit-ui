React = require 'react'
timeUtils    = require '../../../util/time-utils'
TransitLeg   = require './transit-leg'
intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class SubwayLeg extends React.Component

  render: ->

    <TransitLeg
      mode={"SUBWAY"}
      leg={@props.leg}
      focusAction={@props.focusAction}
      index={@props.index}
      >
      <FormattedMessage
        id={"subway-with-route-number"}
        values={{
          routeNumber: @props.leg.route
          }}
        defaultMessage={"Subway {routeNumber}"}/>
    </TransitLeg>


module.exports = SubwayLeg
