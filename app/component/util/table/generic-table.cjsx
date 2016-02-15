React = require 'react'
cx    = require 'classnames'
ComponentUsageExample = require '../../documentation/component-usage-example'

GenericTable = (props) ->

  if props.showLabels
    lowEndLabel = <span className="left">{props.lowEndLabel}</span>
    highEndLabel = <span className="right">{props.highEndLabel}</span>

  <div className="generic-table">
    <div className="row">
      {props.children}
    </div>
    <div className="generic-table__label-container">
      {lowEndLabel}
      {highEndLabel}
    </div>
  </div>

GenericTable.displayName = "GenericTable"

GenericTable.description =
    <div>
      <p>Renders a score table</p>
      <ComponentUsageExample description="">
        <GenericTable/>
      </ComponentUsageExample>
    </div>

GenericTable.propTypes =
  showLabels: React.PropTypes.bool
  lowEndLabel: React.PropTypes.object
  highEndLabel: React.PropTypes.object
module.exports = GenericTable
