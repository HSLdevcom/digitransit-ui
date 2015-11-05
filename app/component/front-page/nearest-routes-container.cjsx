Relay                 = require 'react-relay'
RouteListContainer    = require '../route/route-list-container'
queries               = require '../../queries'
React                 = require 'react'

class NearestRoutesContainer extends React.Component

  constructor: ->
    super
    @state = {
      "useSpinner": true
    }
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  @propTypes:
    lat: React.PropTypes.number.isRequired
    lon: React.PropTypes.number.isRequired

  componentDidMount: =>
    @context.getStore('TimeStore').addChangeListener @onChange
    @setState({"useSpinner": false})

  componentWillUnmount: ->
    @context.getStore('TimeStore').removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  render: =>
    <Relay.RootContainer
      Component={RouteListContainer}
      forceFetch={true}
      route={new queries.RouteListContainerRoute
        lat: @props.lat
        lon: @props.lon
      }
      renderLoading={=> if(@state.useSpinner == true) then <div className="spinner-loader"/> else null}
    />

module.exports = NearestRoutesContainer
