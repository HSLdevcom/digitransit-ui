React                = require 'react'
Modal                = require './modal'
NotImplementedAction = require('../../action/not-implemented-action')
FormattedMessage     = require('react-intl').FormattedMessage
Icon  = require '../icon/icon'
ComponentUsageExample = require '../documentation/component-usage-example'

class NotImplemented extends React.Component

  @description:
    <div>
      <p>
         Placeholder for a 'not implemented' popup. It is activated from clicking of not-implemented-link
      </p>
      <ComponentUsageExample>
        <NotImplemented/>
      </ComponentUsageExample>
    </div>

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
    if state == true || state == false
      newState = state
    else
      newState = !@state.open

    @setState({open: newState}, () =>
      @forceUpdate())

  localName: ->
    name = @context.getStore("NotImplementedStore").getName()
    return name: name

  render: ->
    <Modal allowClicks=true open={@state.open} title="" toggleVisibility={@toggle}>
      <div className="row">
        <div className="small-4 columns">
          <Icon className="not-implemented-icon" img='icon-icon_under-construction'/>
        </div>
        <div className="small-8 columns">
          <h2 className="no-padding no-margin not-implemented-color"><FormattedMessage id="not-implemented" values={@localName()} defaultMessage='{name} - feature is not implemented'/></h2>
        </div>
      </div>
      <div className="row">
        <div className="small-12 columns not-implemented">
          <p>
            <FormattedMessage id="not-implemented-msg" defaultMessage="If you want to participate in the development of this service/feature please see more information from the below links."/>
          </p>
          <a className="primary-color" href="https://github.com/HSLdevcom/digitransit-ui">GitHub &rsaquo;</a><br/>
          <a className="primary-color" href="https://projects.invisionapp.com/share/MY2F0CQ2W#/screens">InVision &rsaquo;</a><br/>
          <a className="primary-color" href="https://digitransit.atlassian.net/secure/Dashboard.jspa">Jira &rsaquo;</a><br/>
        </div>
      </div>
    </Modal>

module.exports = NotImplemented
