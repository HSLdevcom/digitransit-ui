React = require 'react'
cx    = require 'classnames'
ComponentUsageExample = require '../documentation/component-usage-example'

ScoreTable = (props) ->

  if props.showLabels
    lowEndLabel = <span className="left">{props.lowEndLabel}</span>
    highEndLabel = <span className="right">{props.highEndLabel}</span>

  columnWidth = {width: (100.0 / (props.highestScore - props.lowestScore + 1)) + "%"}
  columns = [props.lowestScore ... props.highestScore + 1].map (_, i) =>
    <div
      key={i}
      className={cx "score-table__column", {"selected-score": i == props.selectedScore}}
      style=columnWidth
      onClick={props.handleClick.bind this, i}>
      {i}
    </div>

  <div className="score-table">
    <div className="row">
      {columns}
    </div>
    <div className="score-table__label-container">
      {lowEndLabel}
      {highEndLabel}
    </div>
  </div>

ScoreTable.displayName = "ScoreTable"

ScoreTable.description =
    <div>
      <p>Renders a score table</p>
      <ComponentUsageExample description="">
        <ScoreTable lowestScore={0} highestScore={5} handleClick={() -> console.log("test")}/>
      </ComponentUsageExample>
    </div>

ScoreTable.propTypes =
  lowestScore: React.PropTypes.number.isRequired
  highestScore: React.PropTypes.number.isRequired
  handleClick: React.PropTypes.func.isRequired
  showLabels: React.PropTypes.bool
  lowEndLabel: React.PropTypes.object
  highEndLabel: React.PropTypes.object

module.exports = ScoreTable
