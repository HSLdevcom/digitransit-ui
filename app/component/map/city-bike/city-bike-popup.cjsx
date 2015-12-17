React                 = require 'react'
Icon                  = require '../../icon/icon.cjsx'
MarkerPopupBottom     = require '../marker-popup-bottom'
NotImplementedLink    = require '../../util/not-implemented-link'
{FormattedMessage}    = require('react-intl')
CityBikeContent       = require '../../city-bike/city-bike-content'
CityBikeCard          = require '../../city-bike/city-bike-card'
Example               = require '../../documentation/example-data'
ComponentUsageExample = require '../../documentation/component-usage-example'
{getRoutePath}        = require '../../../util/path'

class CityBikePopup extends React.Component

  @description:
    <div>
      <p>Renders a citybike popup.</p>
      <ComponentUsageExample description="">
        <CityBikePopup
          context={"context object here"}
          station={Example.station}>
          Im content of a citybike card
        </CityBikePopup>
      </ComponentUsageExample>
    </div>

  @displayName: "CityBikePopup"

  @propTypes:
    station: React.PropTypes.object.isRequired
    context: React.PropTypes.object.isRequired

  render: ->
    locationString = if @props.context.getStore then @props.context.getStore('PositionStore').getLocationString() else ""
    routePath = getRoutePath(locationString , @props.station.name + '::' + @props.station.y + ',' + @props.station.x)
    <div className="card">
      <CityBikeCard
        className={"padding-small"}
        station={@props.station}>
        <CityBikeContent station={@props.station}/>
      </CityBikeCard>
      <MarkerPopupBottom routeHere={routePath}>
        <NotImplementedLink nonTextLink={true} name={<FormattedMessage id='extra-info' defaultMessage='More info' />}>
          <Icon img={'icon-icon_info'}/> Lisätietoa<br/>
        </NotImplementedLink>
      </MarkerPopupBottom>
    </div>


module.exports = CityBikePopup
