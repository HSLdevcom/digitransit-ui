React                 = require 'react'
Link                  = require 'react-router/lib/Link'
NotImplementedLink    = require '../util/not-implemented-link'
{FormattedMessage}    = require('react-intl')
CardHeader            = require '../card/card-header'
Example               = require '../documentation/example-data'
ComponentUsageExample = require '../documentation/component-usage-example'
Card                  = require '../card/card'

CityBikeCard = ({station, children, className}) ->
  if !station || !children || children.length == 0
    return false
  <div>
    <Card className={className}>
      <CardHeader
        name={station.name}
        description={station.stationId}
      />
      {children}
    </Card>
  </div>

CityBikeCard.description =
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

CityBikeCard.displayName = "CityBikeCard"

CityBikeCard.propTypes =
  station: React.PropTypes.object.isRequired
  className: React.PropTypes.string

module.exports = CityBikeCard
