React     = require 'react'
Modal     = require '../util/modal'
DisruptionRowContainer  = require './disruption-row-container'



class DisruptionInfo extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  @propTypes:
    open: React.PropTypes.bool
    toggleDisruptionInfo: React.PropTypes.func

  componentDidMount: ->
    @context.getStore('DisruptionStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('DisruptionStore').removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  render: ->
    data = @context.getStore('DisruptionStore').getData()
    disruptionRowContainers = data?.entity.map (disruption) ->
      <DisruptionRowContainer key={disruption.id} disruption={disruption}/>

    <Modal open={@props.open} headerText="Poikkeusinfo" toggleVisibility={@props.toggleDisruptionInfo}>
      {disruptionRowContainers}
    </Modal>

module.exports = DisruptionInfo
