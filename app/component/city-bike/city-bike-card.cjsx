React                 = require 'react'
Link                  = require 'react-router/lib/Link'
NotImplementedLink    = require '../util/not-implemented-link'
{FormattedMessage}    = require('react-intl')
CardHeader            = require '../card/card-header'
Example               = require '../documentation/example-data'
ComponentUsageExample = require '../documentation/component-usage-example'
Card                  = require '../card/card'

class CityBikeCard extends React.Component

  @description:
    <div>
      <p>Renders a citybike card with header and child props as content</p>
      <ComponentUsageExample description="">
        <CityBikeCard
          className={"padding-small"}
          station={Example.station}>
          Im content of the citybike card
        </CityBikeCard>
      </ComponentUsageExample>
    </div>

  @displayName: "CityBikeCard"

  @propTypes:
    station: React.PropTypes.object.isRequired
    className: React.PropTypes.string

  getContent: =>
    <Card className={@props.className}>
      <CardHeader
        name={@props.station.name}
        description={@props.station.name}
      />
      {@props.children}
    </Card>

  render: ->
    if !@props.station || !@props.children || @props.children.length == 0
      return false
    <div>
      {@getContent()}
    </div>


module.exports = CityBikeCard
