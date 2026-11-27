import PropTypes from 'prop-types';
import ShowOnMapButton from './ShowOnMapButton';

/** Gray info row of an itinerary leg: a description and a button that focuses the map. */
export default function LegDetails({ children, focusAction, target = '', ariaLabelId }) {
  return (
    <div className="itinerary-leg-action itinerary-leg-action-content">
      {children}
      <ShowOnMapButton target={target} focusAction={focusAction} ariaLabelId={ariaLabelId} />
    </div>
  );
}

LegDetails.propTypes = {
  children: PropTypes.node.isRequired,
  focusAction: PropTypes.func.isRequired,
  target: PropTypes.string,
  ariaLabelId: PropTypes.string,
};
