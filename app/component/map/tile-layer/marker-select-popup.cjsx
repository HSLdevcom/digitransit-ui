React                 = require 'react'
SelectStopRow         = require './select-stop-row'

class MarkerSelectPopup extends React.Component
  render: ->
    options = @props.options.map (option) ->
      if option.layer == "stop"
        <SelectStopRow key={option.feature.properties.gtfsId} {...option.feature.properties}/>

    <div className="card">
      <h3 className="padding-normal">Valitse pysäkki</h3>
      {options}
    </div>


module.exports = MarkerSelectPopup
