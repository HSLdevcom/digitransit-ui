React                = require 'react'
Modal                = require './modal'
NotImplementedAction = require('../../action/notimplemented-action')
class NotImplemented extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  constructor: ->
    super
    console.log("c", @context)
    @state =
      open: false

  componentDidMount: ->
    @context.getStore("NotImplementedStore").addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore("NotImplementedStore").removeChangeListener @onChange

  onChange: (details) =>
    console.log "onChange"
    @toggle true

  @onClick: (context, id, defaultMessage) ->
    () =>
      context.executeAction NotImplementedAction.click, {id:id, defaultMessage:defaultMessage}

  toggle: (state) =>
    newState = state==true||state==false|| !@state.open
    console.log("new state", newState)
    @setState({open: newState}, ()->
      console.log "called back";
      @forceUpdate())

  render: ->
    <Modal open={@state.open} id="not-implemented-title" defaultMessage="Not Implemented" toggleVisibility={@toggle}>
      <p>
        Jos haluat osallistua kehitystyöhön, löydät lisätietoa suunnitelluista toiminnallisuuksista oheisista linkeistä.
      </p>
      <a href="#">Github</a><br/>
      <a href="#">Invision</a><br/>
      <a href="#">Jira</a><br/>
    </Modal>


module.exports = NotImplemented
