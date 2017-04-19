import React from 'react';
import Icon from './Icon';

const ItineraryCircleLine = props =>
  <div className={`leg-before ${props.modeClassName}`} >
    {props.index === 0 ? (
      <div className="itinerary-icon-container-from"><Icon img="icon-icon_mapMarker-point" className="itinerary-icon from" /></div>
          ) : <div className={`leg-before-circle circle-fill ${props.modeClassName}`} /> }
    <div className={`leg-before-line ${props.modeClassName}`} />
  </div>;

ItineraryCircleLine.defaultProps = {
  index: undefined,
};

ItineraryCircleLine.propTypes = {
  index: React.PropTypes.string,
  modeClassName: React.PropTypes.string.isRequired,
};

export default ItineraryCircleLine;
