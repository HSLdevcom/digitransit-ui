import React from 'react';
import PropTypes from 'prop-types';

const ResultsProgressBar = ({ currentAmount, totalAmount }) => {
  const percentage =
    totalAmount > 0 ? Math.min((currentAmount / totalAmount) * 100, 100) : 0;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '3px',
        background: '#e0e0e0', // gray line for total
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '3px',
          width: `${percentage}%`,
          background: 'black', // progress line
          borderRadius: '4px',
          transition: 'width 0.3s',
        }}
      />
    </div>
  );
};

ResultsProgressBar.propTypes = {
  currentAmount: PropTypes.number.isRequired,
  totalAmount: PropTypes.number.isRequired,
};

export default ResultsProgressBar;
