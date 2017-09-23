import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import range from 'lodash/range';
import ComponentUsageExample from './ComponentUsageExample';
import GenericTable from './GenericTable';

const Column = ({ i, columnWidth, handleClick, selectedScore }) => (
  <div
    className={cx('score-table-column', {
      'selected-score': i === selectedScore,
    })}
    style={{ width: `${columnWidth}%` }}
    onClick={handleClick.bind(this, i)} // eslint-disable-line react/jsx-no-bind
  >
    {i}
  </div>
);

Column.propTypes = {
  i: PropTypes.number.isRequired,
  columnWidth: PropTypes.number.isRequired,
  handleClick: PropTypes.func.isRequired,
  selectedScore: PropTypes.number,
};

function ScoreTable(props) {
  const columnWidth = 100 / (props.highestScore - props.lowestScore + 1);

  const columns = range(props.lowestScore, props.highestScore + 1).map(i => (
    <Column
      i={i}
      key={i}
      columnWidth={columnWidth}
      selectedScore={props.selectedScore}
      handleClick={props.handleClick}
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

ScoreTable.description = () => (
  <div>
    <p>Renders a score table</p>
    <ComponentUsageExample description="">
      <ScoreTable lowestScore={0} highestScore={5} handleClick={() => {}} />
    </ComponentUsageExample>
  </div>
);

ScoreTable.propTypes = {
  lowestScore: PropTypes.number.isRequired,
  highestScore: PropTypes.number.isRequired,
  handleClick: PropTypes.func.isRequired,
  selectedScore: PropTypes.number,
  showLabels: PropTypes.bool,
  lowEndLabel: PropTypes.object,
  highEndLabel: PropTypes.object,
};

export default ScoreTable;
