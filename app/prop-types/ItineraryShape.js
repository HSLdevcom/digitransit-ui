import PropTypes from 'prop-types';

export default PropTypes.shape({
  startTime: PropTypes.number,
  endTime: PropTypes.number,
  duration: PropTypes.number,
  walkDistance: PropTypes.number,
  legs: PropTypes.arrayOf(PropTypes.object),
  emissionsPerPerson: PropTypes.shape({
    co2: PropTypes.number,
  }),
});
