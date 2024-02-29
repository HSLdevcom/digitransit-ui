import { PropTypes } from 'prop-types';
import ItineraryShape from './ItineraryShape';

export default PropTypes.shape({
  itineraries: PropTypes.arrayOf(ItineraryShape).isRequired,
});
