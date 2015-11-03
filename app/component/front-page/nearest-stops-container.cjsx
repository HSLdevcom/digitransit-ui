Relay                  = require 'react-relay'
StopCardListContainer  = require '../stop-cards/nearest-stop-card-list-container'
queries                = require '../../queries'
React                  = require 'react'

class NearestStopsContainer extends React.Component

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

  render: =>
    <Relay.RootContainer
      Component={StopCardListContainer}
      forceFetch={true}
      route={new queries.StopListContainerRoute
        lat: @props.lat
        lon: @props.lon
      }
      renderLoading={-> <div className="spinner-loader"/>}
      }
    />
module.exports = NearestStopsContainer