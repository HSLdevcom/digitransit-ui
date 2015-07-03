React = require 'react'
Icon = require '../icon/icon'
PlainSearch = require './plain-search'
Link = require 'react-router/lib/components/Link'

locationValue = (location) ->
  decodeURIComponent(location.split("::")[0])

transformProps = (props) ->
  from: props.params.from  # An actual location with coordinates
  to: props.params.to
  # We need to track the content of the input fields to make them controlled
  # https://facebook.github.io/react/docs/forms.html#controlled-components
  fromValue: locationValue(props.params.from)
  toValue: locationValue(props.params.to)

class FromToSearch extends React.Component
  @contextTypes:
    router: React.PropTypes.func.isRequired

  constructor: (props) ->
    super
    @state = transformProps(props)

  # This function is called when we "transition" within the page
  # for example when changing direction. Without this the state
  # would not change because even when the old url is pushed to history,
  # the actual components are never recreated.
  # Result would be that for example the link to change direction would
  # not change.
  componentWillReceiveProps: (newProps) =>
    @setState(transformProps(newProps))

  selectOrigin: (location) =>
    @setState {from: "#{location.description}::#{location.lat},#{location.lon}"}
    @search()

  selectDestination: (location) =>
    @setState {to: "#{location.description}::#{location.lat},#{location.lon}"}
    @search()

  onSearch: (e) =>
    # XXX Will not work without JS
    e.preventDefault()
    @search()

  onSwitch: =>
    from = React.findDOMNode(@refs.from.autosuggestInput).value
    to = React.findDOMNode(@refs.to.autosuggestInput).value
    if (from is locationValue(@state.from) and
        to is locationValue(@state.to))
      # The user has not changed the inputs, so we can directly change the actual route
      @setState {from: @state.to, to: @state.from}
      @search()
    else
      # The user has changed the inputs, so we only switch the texts
      @setState
        from: @state.to
        fromValue: to
        to: @state.from
        toValue: from

  # Get new itineraries for new origin and destination
  search: =>
    routes = @context.router.getCurrentRoutes()
    setTimeout(
      () =>
        @context.router.transitionTo(routes[routes.length - 1].name,
                                     {from: @state.from, to: @state.to})
      , 0)


  render: =>
    <div className="search-form">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              <PlainSearch ref="from"
                           value={@state.fromValue}
                           onSelection={@selectOrigin} />
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
              <PlainSearch ref="to"
                           value={@state.toValue}
                           onSelection={@selectDestination} />
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

module.exports = FromToSearch
