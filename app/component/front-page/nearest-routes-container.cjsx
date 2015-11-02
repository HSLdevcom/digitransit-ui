Relay                 = require 'react-relay'
RouteListContainer    = require '../route/route-list-container'
queries               = require '../../queries'
React                 = require 'react'

class NearestRoutesContainer extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  @propTypes:
    lat: React.PropTypes.number.isRequired
    lon: React.PropTypes.number.isRequired

  componentDidMount: ->
    @context.getStore('TimeStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('TimeStore').removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  render: ->
    <Relay.RootContainer
      Component={RouteListContainer}
      forceFetch={true}
      route={new queries.RouteListContainerRoute
        lat: @props.lat
        lon: @props.lon
      }
      renderLoading={-> <div className="spinner-loader"/>}
    />

module.exports = NearestRoutesContainer