import React from 'react';
import PropTypes from 'prop-types';
import DTAutosuggestPanel from './DTAutosuggestPanel';
import { dtLocationShape } from '../util/shapes';

const InfoPanelContainer = props => {
  return (
    <div className="info-panel-container-left">
      <DTAutosuggestPanel
        origin={props.origin}
        destination={props.destination}
        tab={props.tab}
        searchType="all"
        originPlaceHolder="search-origin"
        destinationPlaceHolder="search-destination"
      />
    </div>
  );
};
InfoPanelContainer.propTypes = {
  origin: dtLocationShape.isRequired,
  destination: dtLocationShape.isRequired,
  tab: PropTypes.string,
};
export default InfoPanelContainer;
