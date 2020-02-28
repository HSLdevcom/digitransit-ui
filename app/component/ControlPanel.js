import React from 'react';
import DTAutosuggestPanel from './DTAutosuggestPanel';
import { dtLocationShape } from '../util/shapes';
/*
* Panel containing all data and control components locating in column next (or below) to the map. 
*/
const ControlPanel = props => {
  return (
    <div className="info-panel-container-left">
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
};
export default ControlPanel;
