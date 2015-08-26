React = require 'react'
Icon = require '../icon/icon'
EndpointActions  = require '../../action/endpoint-actions.coffee'
PlainSearch = require './plain-search'
Link = require 'react-router/lib/components/Link'
config = require '../../config'

locationValue = (location) ->
  decodeURIComponent(location.split("::")[0])

class SearchTwoFields extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  constructor: (props) ->
    super

  componentWillMount: =>
    @setState
        fromValue: ""
        toValue: ""
        useOriginPosition: true
        useDestinationPosition: false

  selectOrigin: (point) =>
    @context.executeAction EndpointActions.setOrigin, {
                           'lat': point.lat
                           'lon': point.lon
                           'address': point.address
    }

  selectDestination: (point) =>
    @context.executeAction EndpointActions.setDestination, {
                           'lat': point.lat
                           'lon': point.lon
                           'address': point.address
    }

  onToChange: (value) =>
    @setState {toValue: value}

  onSearch: (e) =>
    e.preventDefault()

  onSubmit: (e) =>
    e.preventDefault()

  removePositionFromOrigin: () =>
    @setState {useOriginPosition: false}

  removePositionFromDestination: () =>
    @setState {useDestinationPosition: false}

  render: =>
    <div className="search-form">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              <PlainSearch value={@state.fromValue}
                           filterCities={config.cities}
                           onInput={@onFromChange}
                           onSelection={@selectOrigin}
                           placeholder="Lähtöpaikka"
                           removePosition={@removePositionFromOrigin}
                           useCurrentPosition=@state.useOriginPosition
                           />
            </div>
            <div className="small-1 columns">
              <span className="postfix search cursor-pointer" onTouchTap={@onSwitch}>
                <Icon img={'icon-icon_direction-a'}/>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              <PlainSearch value={@state.toValue}
                           filterCities={config.cities}
                           onInput={@onToChange}
                           onSelection={@selectDestination}
                           placeholder="Määränpää"
                           removePosition={@removePositionFromDestination}
                           useCurrentPosition=@state.useDestinationPosition
                           />
            </div>
            <div className="small-1 columns">
              <span className="postfix search cursor-pointer" onTouchTap={@onSearch}>
                <Icon img={'icon-icon_search'}/>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

module.exports = SearchTwoFields
