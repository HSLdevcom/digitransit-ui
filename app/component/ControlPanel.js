import React from 'react';
import PropTypes from 'prop-types';
import DTAutosuggestPanel from './DTAutosuggestPanel';
import { dtLocationShape } from '../util/shapes';
/*
* Panel containing all data and control components locating in column next (or below) to the map. 
*/
const ControlPanel = props => {
  return (
    <div className={props.className}>
      <DTAutosuggestPanel
        origin={props.origin}
        destination={props.destination}
        searchType="all"
        originPlaceHolder="search-origin"
        destinationPlaceHolder="search-destination"
      />
    </div>
  );
};
ControlPanel.propTypes = {
  origin: dtLocationShape.isRequired,
  destination: dtLocationShape.isRequired,
  className: PropTypes.string.isRequired,
};
export default ControlPanel;
