import React from 'react';
import cx from 'classnames';
import range from 'lodash/range';
import ComponentUsageExample from './ComponentUsageExample';
import GenericTable from './GenericTable';

const Column = ({ i, columnWidth, handleClick, selectedScore }) => (
  <div
    className={cx('score-table-column', { 'selected-score': i === selectedScore })}
    style={{ width: `${columnWidth}%` }}
    onClick={handleClick.bind(this, i)} // eslint-disable-line react/jsx-no-bind
  >
    {i}
  </div>
);

Column.propTypes = {
  i: React.PropTypes.number.isRequired,
  columnWidth: React.PropTypes.number.isRequired,
  handleClick: React.PropTypes.func.isRequired,
  selectedScore: React.PropTypes.number,
};

function ScoreTable(props) {
  const columnWidth = 100 / ((props.highestScore - props.lowestScore) + 1);

  const columns = range(props.lowestScore, props.highestScore + 1).map(i => (
    <Column
      i={i} key={i} columnWidth={columnWidth}
      selectedScore={props.selectedScore} handleClick={props.handleClick}
    />
  ));

  return (
    <GenericTable
      showLabels={props.showLabels}
      lowEndLabel={props.lowEndLabel}
      highEndLabel={props.highEndLabel}
    >
      {columns}
    </GenericTable>
  );
}

ScoreTable.displayName = 'ScoreTable';

ScoreTable.description = () =>
  <div>
    <p>Renders a score table</p>
    <ComponentUsageExample description="">
      <ScoreTable lowestScore={0} highestScore={5} handleClick={() => {}} />
    </ComponentUsageExample>
  </div>;

ScoreTable.propTypes = {
  lowestScore: React.PropTypes.number.isRequired,
  highestScore: React.PropTypes.number.isRequired,
  handleClick: React.PropTypes.func.isRequired,
  showLabels: React.PropTypes.bool,
  lowEndLabel: React.PropTypes.object,
  highEndLabel: React.PropTypes.object,
};

export default ScoreTable;
