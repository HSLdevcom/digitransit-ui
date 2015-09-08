React           = require 'react'
moment          = require 'moment'
DisruptionRow   = require './disruption-row'
GtfsUtils       = require '../../util/gtfs'


class DisruptionRowContainer extends React.Component
  getLineText: (lineList)  ->
    lineRouteList = []
    lineList.map (lineData) ->
      if lineRouteList.indexOf(lineData.route_id) == -1
        lineRouteList.push lineData.route_id
    text = lineRouteList.join(", ")
    return text

  # available languages: fi, se, en
  getDescriptionByLanguage: (descriptionList, language) ->
    descriptionList.map (description) ->
      if(description.language == language)
        return description.text

  render: ->
    data = @props.disruption.alert
    lineText = @getLineText(data.informed_entity)
    mode = GtfsUtils.typeToName[data.informed_entity[0].route_type]
    startTime = moment(data.active_period[0].start)
    endTime = moment(data.active_period[0].end)
    cause = data.cause

    description = @getDescriptionByLanguage(data.description_text.translation, "fi")

    <DisruptionRow
      mode={mode}
      line={lineText}
      startTime={startTime}
      endTime={endTime}
      description={description}
      cause={cause}
    />

module.exports = DisruptionRowContainer
