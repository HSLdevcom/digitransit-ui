import PropTypes from 'prop-types';

export default PropTypes.shape({
  endTime: PropTypes.number,
  startTime: PropTypes.number,
  legs: PropTypes.arrayOf(PropTypes.object),
  emissionsPerPerson: PropTypes.shape({
    co2Grams: PropTypes.number,
  }),
});
