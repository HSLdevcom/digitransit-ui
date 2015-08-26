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
    getStore: React.PropTypes.func.isRequired
    router: React.PropTypes.func.isRequired

  constructor: (props) ->
    super

  componentWillMount: =>
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange
    @setState
        origin: @context.getStore('EndpointStore').getOrigin()
        destination: @context.getStore('EndpointStore').getDestination()

  onEndpointChange: =>
    @setState
        origin: @context.getStore('EndpointStore').getOrigin()
        destination: @context.getStore('EndpointStore').getDestination()
    @routeIfPossible()

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

  routeIfPossible: =>
    # If we have a geolocation, the search fields using the location will
    # update their selection constantly (and fire onSelects)
    if @state.origin.lat and @state.destination.lat
      # First, we must blur input field because without this
      # Android keeps virtual keyboard open too long which
      # causes problems in next page rendering
      #@autoSuggestInput.blur()

      # Then we can transition. We must do this in next
      # event loop in order to get blur finished.
      setTimeout(() =>
        @context.router.transitionTo "summary",
          from: "#{@state.origin.address}::#{@state.origin.lat},#{@state.origin.lon}"
          to: "#{@state.destination.address}::#{@state.destination.lat},#{@state.destination.lon}"
      ,0)

  onSearch: (e) =>
    e.preventDefault()

  clearOrigin: () =>
    # This happens within geolocation store emit changes, but it's not cascading
    # since it's a different store, so it's ok.
    @context.executeAction EndpointActions.clearOrigin

  clearDestination: () =>
    @context.executeAction EndpointActions.clearDestination

  render: =>
    <div className="search-form">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              <PlainSearch
                onSelection={@selectOrigin}
                placeholder="Lähtöpaikka"
                clearSelection={@clearOrigin}
                selection=@state.origin
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
              <PlainSearch
                onSelection={@selectDestination}
                placeholder="Määränpää"
                clearSelection={@clearDestination}
                selection=@state.destination
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
