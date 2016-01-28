Relay   = require 'react-relay'
NearestStopCardListContainer  = require '../stop-cards/nearest-stop-card-list-container'
queries = require '../../queries'
React   = require 'react'

class NearestStopsContainer extends React.Component

  constructor: ->
    super
    @state =
      useSpinner: true


  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  @propTypes:
    lat: React.PropTypes.number.isRequired
    lon: React.PropTypes.number.isRequired

  shouldComponentUpdate: (nextProps, nextState) =>
    ## rerender only when location changes
    if nextProps.lat == @props.lat && nextProps.lon == @props.lon
      return false
    true

  componentDidMount: ->
    @context.getStore('TimeStore').addChangeListener @onChange
    @setState({"useSpinner": false})

  componentWillUnmount: ->
    @context.getStore('TimeStore').removeChangeListener @onChange

  onChange: (e) =>
    if e.currentTime
      @forceUpdate()

  render: =>
    <Relay.RootContainer
      Component={NearestStopCardListContainer}
      forceFetch={true}
      route={new queries.StopListContainerRoute(
        lat: @props.lat
        lon: @props.lon
        date: @context.getStore('TimeStore').getCurrentTime().format("YYYYMMDD")
      )}
      renderLoading={=> if(@state.useSpinner == true) then <div className="spinner-loader"/> else undefined}
    />


module.exports = NearestStopsContainer
