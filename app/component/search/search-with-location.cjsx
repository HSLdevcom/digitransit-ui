React = require 'react'
Icon = require '../icon/icon.cjsx'
LocateActions  = require '../../action/locate-actions.coffee'
PlainSearch = require './plain-search.cjsx'
Location = require './location.cjsx'

class SearchWithLocation extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.func.isRequired

  componentWillMount: =>
    @context.getStore('LocationStore').addChangeListener @onLocationChange
    @setState @context.getStore('LocationStore').getLocationState()

  componentWillUnmount: =>
    @context.getStore('LocationStore').removeChangeListener @onLocationChange

  onLocationChange: =>
    @context.router.replaceWith(@context.router.getCurrentPathname(),
                                @context.router.getCurrentParams())
    @setState @context.getStore('LocationStore').getLocationState()

  suggestionSelected: (suggestion, e) =>
    if @state.hasLocation
      # First, we must blur input field because without this
      # Android keeps virtual keyboard open too long which
      # causes problems in next page rendering
      @refs.autosuggest.autosuggestInput.blur()

      # Then we can transition. We must do this in next
      # event loop in order to get blur finished.
      setTimeout(() =>
        @context.router.transitionTo "summary",
          from: "#{@state.address}::#{@state.lat},#{@state.lon}"
          to: "#{suggestion.description}::#{suggestion.lat},#{suggestion.lon}"
      ,0)
    else
      @context.executeAction LocateActions.manuallySetPosition, {
        'lat': suggestion.lat
        'lon': suggestion.lon
        'address': suggestion.description
      }

  render: ->
    inputDisabled = ""
    if @state.isLocationingInProgress
      inputDisabled = 'disabled'
      placeholder = 'Odota, sijaintiasi etsitään'
    else if @state.hasLocation
      placeholder = 'Määränpään osoite, linja tai pysäkki'
    else
      placeholder = 'Lähtöosoite, linja tai pysäkki'

    inputAttributes =
      placeholder: placeholder
      disabled: inputDisabled

    <div className="search-form">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row">
            <div className="small-12 columns">
              <Location/>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              <PlainSearch ref="autosuggest"
                           inputAttributes={inputAttributes}
                           onSelection={@suggestionSelected} />
            </div>
            <div className="small-1 columns">
              <span className="postfix search cursor-pointer"
                    onTouchTap={(e) -> e.preventDefault()}>
                <Icon img={'icon-icon_search'}/>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

module.exports = SearchWithLocation
