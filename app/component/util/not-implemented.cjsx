React                = require 'react'
Modal                = require './modal'
NotImplementedAction = require('../../action/not-implemented-action')
FormattedMessage     = require('react-intl').FormattedMessage
Icon                 = require('../icon/icon')

class NotImplemented extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired

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

  toggle: (state) =>
    if(state==true || state==false)
      newState = state
    else
      newState = !@state.open
    @setState({open: newState}, ()->
      console.log "forceUpdate"
      @forceUpdate())

  localName: ->
    name = @context.getStore("NotImplementedStore").getName()
    return name: name

  render: ->
    <Modal allowClicks=true open={@state.open} title={<FormattedMessage id="not-implemented" values={@localName()} defaultMessage='{name} - feature is not implemented'/>} toggleVisibility={@toggle}>
      <Icon img='icon-icon_under-construction'/>
      <p>
        <FormattedMessage id="not-implemented-msg" defaultMessage="If you want to participate into development of this service/feature please see more information from the below links."/>
      </p>
      <a href="https://github.com/HSLdevcom/digitransit-ui">Github</a><br/>
      <a href="https://projects.invisionapp.com/share/MY2F0CQ2W#/screens">Invision</a><br/>
      <a href="https://digitransit.atlassian.net/secure/Dashboard.jspa">Jira</a><br/>
    </Modal>

module.exports = NotImplemented
