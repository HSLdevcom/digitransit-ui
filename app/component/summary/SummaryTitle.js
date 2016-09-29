import React from 'react';

export default function SummaryTitle(props) {
  return (
    <span>
      {props.params.hash == null ? 'Reittiehdotukset' : 'Reittiohje'}
    </span>
  );
}

SummaryTitle.propTypes = {
  params: React.PropTypes.shape({
    hash: React.PropTypes.string,
  }).isRequired,
};
