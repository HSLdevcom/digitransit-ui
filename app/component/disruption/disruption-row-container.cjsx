React           = require 'react'
Relay           = require 'react-relay'
queries         = require '../../queries'
moment          = require 'moment'
DisruptionRow   = require './disruption-row'
GtfsUtils       = require '../../util/gtfs'
uniq            = require 'lodash/array/uniq'



class DisruptionRowContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  # available languages: fi, se, en
  getDescriptionByLanguage: (descriptionList, language) ->
    if language == 'sv'
      language = 'se'

    descriptionList.map (description) ->
      if(description.language == language)
        return description.text

  render: ->
    data = @props.disruption.alert
    startTime = moment(data.active_period[0].start * 1000)
    endTime = moment(data.active_period[0].end * 1000)
    cause = data.cause

    description = @getDescriptionByLanguage(data.description_text.translation, @context.getStore('PreferencesStore').getLanguage())

    <Relay.RootContainer
      Component={DisruptionRow}
      route={new queries.DisruptionRowRoute(
        ids: data.informed_entity.map (entity) -> "#{entity.agency_id}:#{entity.route_id}"
      )}
      renderFetched={(data) =>
        <DisruptionRow
          routes={route for route in data.routes when route}
          startTime={startTime}
          endTime={endTime}
          description={description}
          cause={cause}
        />
      }
    />

module.exports = DisruptionRowContainer
