React = require 'react'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage
FormattedRelative = intl.FormattedRelative

class Distance extends React.Component

  render: ->

    if @props.distance > 0
      approxDistance = Math.round(@props.distance / 50) * 50
      if approxDistance > 50
        <FormattedMessage
          id='approx-meters'
          values={{
            approxDistance: approxDistance}}
          defaultMessage='About {approxDistance} meters' />
      else
        return null
    else
      return null

module.exports = Distance
