React                 = require 'react'
Icon                  = require '../icon/icon.cjsx'
StopCard              = require '../stop-cards/stop-card'
MarkerPopupBottom     = require './marker-popup-bottom'
NotImplementedLink    = require '../util/not-implemented-link'
{FormattedMessage}    = require('react-intl')
CityBikeContent     = require('../city-bike/city-bike-content')


class CityBikePopup extends React.Component

  addDesc: (station) =>
    station.desc = station.name
    station

  render: ->

    station = @addDesc @props.station

    <div className="card">
      <StopCard
        className={"padding-small"}
        stop={station}
        favourite={false}
        cityBike={true}>
        <CityBikeContent station={station}/>
      </StopCard>
      <MarkerPopupBottom routeHere="/reitti/#{@props.context.getStore('PositionStore').getLocationString()}/#{station.name}::#{station.y},#{station.x}">
        <NotImplementedLink nonTextLink={true} name={<FormattedMessage id='extra-info' defaultMessage='More info' />}>
          <Icon img={'icon-icon_info'}/> Lisätietoa<br/>
        </NotImplementedLink>
      </MarkerPopupBottom>
    </div>


module.exports = CityBikePopup
