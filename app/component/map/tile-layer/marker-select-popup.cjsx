React                 = require 'react'
SelectStopRow         = require './select-stop-row'
SelectCitybikeRow     = require './select-citybike-row'
{intlShape, FormattedMessage} = require 'react-intl'

MarkerSelectPopup = (props) ->

  rows = props.options.map (option, index) ->
    if option.layer == "stop"
      <SelectStopRow key={option.feature.properties.gtfsId} {...option.feature.properties}/>
    else if option.layer == "citybike"
      <SelectCitybikeRow
        key={option.feature.properties.stationId}
        {...option.feature.properties}
        selectCitybikeRow={() => props.selectCitybikeRow option}/>

  <div className="card">
    <h3 className="padding-normal">
      <FormattedMessage id='choose-stop' defaultMessage='Choose stop' />
    </h3>
    {rows}
  </div>

MarkerSelectPopup.displayName = "MarkerSelectPopup"

module.exports = MarkerSelectPopup
