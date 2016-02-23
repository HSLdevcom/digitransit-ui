React      = require 'react'
ModeFilter = require '../util/mode-filter'
ModeSelectedAction = require '../../action/mode-selected-action'

class ModeFilterContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  render: ->
    <ModeFilter store={@context.getStore('ModeStore')} action={ModeSelectedAction} buttonClass="btn mode-icon"/>

module.exports = ModeFilterContainer
