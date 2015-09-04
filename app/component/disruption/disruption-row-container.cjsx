React           = require 'react'
moment          = require 'moment'
DisruptionRow   = require './disruption-row'
GtfsUtils       = require '../../util/gtfs'


class DisruptionRowContainer extends React.Component
  @propTypes:
    disruption: React.PropTypes.obj

  getLineText: (lineList)  ->
    lineRouteList = []
    for lineData, i in lineList
      if lineRouteList.indexOf(lineData.route_id) == -1
        lineRouteList.push lineData.route_id
    text = lineRouteList.join(", ")
    return text

  getDescriptionByLanguage: (descriptionList) ->
    # TODO: check for active language. Now returning Finnish text
    # [0] - fi, [1] - se, [2] - en
    descriptionList[0].text

  render: ->
    data = @props.disruption.alert
    lineText = @getLineText(data.informed_entity)
    mode = GtfsUtils.typeToName[data.informed_entity[0].route_type]
    startTime = moment(data.active_period[0].start)
    endTime = moment(data.active_period[0].end)
    cause = data.cause

    description = @getDescriptionByLanguage(data.description_text.translation)

    <DisruptionRow
      mode={mode}
      line={lineText}
      startTime={startTime}
      endTime={endTime}
      description={description}
      cause={cause}
    />

module.exports = DisruptionRowContainer
