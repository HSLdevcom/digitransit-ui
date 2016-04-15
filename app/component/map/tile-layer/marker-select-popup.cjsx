React                 = require 'react'
SelectStopRow         = require './select-stop-row'
SelectCitybikeRow     = require './select-citybike-row'
{intlShape, FormattedMessage} = require 'react-intl'

MarkerSelectPopup = ({options}, {intl}) ->
  rows = options.map (option) ->
    if option.layer == "stop"
      <SelectStopRow key={option.feature.properties.gtfsId} {...option.feature.properties}/>
    else if option.layer == "citybike"
      <SelectCitybikeRow key={option.feature.properties.stationId} {...option.feature.properties}/>

  <div className="card">
    <h3 className="padding-normal">
      <FormattedMessage id='choose-stop' defaultMessage='Choose stop' />
    </h3>
    {rows}
  </div>

SelectStopRow.contextTypes =
  intl: intlShape.isRequired

module.exports = MarkerSelectPopup
