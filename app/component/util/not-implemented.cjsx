React                = require 'react'
Modal                = require './modal'
NotImplementedAction = require('../../action/notimplemented-action')
FormattedMessage     = require('react-intl').FormattedMessage

class NotImplemented extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  constructor: ->
    super
    @state =
      open: false

  componentDidMount: ->
    @context.getStore("NotImplementedStore").addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore("NotImplementedStore").removeChangeListener @onChange

  onChange: (details) =>
    @toggle true

  @onClick: (context, id, defaultMessage) ->
    (e) =>
      e.preventDefault() if e
      context.executeAction NotImplementedAction.click, {id:id, defaultMessage:defaultMessage}
      false

  toggle: (state) =>
    newState = state==true||state==false|| !@state.open
    @setState({open: newState}, ()->
      @forceUpdate())

  render: ->
    <Modal open={@state.open} id="not-implemented-title" defaultMessage="Not Implemented" toggleVisibility={@toggle}>
      <p>
        <FormattedMessage id="not-implemented-msg" defaultMessage="If you want to participate into development of this service/feature please see more information from the below links."/>
      </p>
      <a href="https://github.com/HSLdevcom/digitransit-ui">Github</a><br/>
      <a href="https://projects.invisionapp.com/share/MY2F0CQ2W#/screens">Invision</a><br/>
      <a href="https://digitransit.atlassian.net/secure/Dashboard.jspa">Jira</a><br/>
    </Modal>


module.exports = NotImplemented
