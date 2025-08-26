import React from 'react';
import { matchShape } from 'found';
import EmbeddedSearch from './EmbeddedSearch';

const EmbeddedSearchContainer = props => {
  return <EmbeddedSearch match={props.match} />;
};

EmbeddedSearchContainer.propTypes = {
  match: matchShape.isRequired,
};

export default EmbeddedSearchContainer;
