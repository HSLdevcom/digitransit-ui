React                   = require 'react'
Relay                   = require 'react-relay'
queries                 = require '../../queries'
Modal                   = require '../util/modal'
DisruptionListContainer = require './disruption-list-container'
FormattedMessage        = require('react-intl').FormattedMessage

class DisruptionInfo extends React.Component
  constructor: ->
    super
    @state =
      useSpinner: true

  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  @propTypes:
    open: React.PropTypes.bool
    toggleDisruptionInfo: React.PropTypes.func

  render: ->
    if typeof window != 'undefined'
      <Modal open={@props.open} title={<FormattedMessage id="disruption-info" defaultMessage="Disruption Info"/>} toggleVisibility={@props.toggleDisruptionInfo}>
        <Relay.RootContainer
          Component={DisruptionListContainer}
          forceFetch={true}
          route={new queries.DisruptionInfoRoute()}
          renderLoading={=> if(@state.useSpinner == true) then <div className="spinner-loader"/> else undefined}
        />
      </Modal>
    else
      <div></div>


module.exports = DisruptionInfo
