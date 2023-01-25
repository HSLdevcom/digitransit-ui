import moment from 'moment';
import PropTypes from 'prop-types';

const LocalTime = ({ forceUtc, time }) => {
  const wrapper = Number.isFinite(time)
    ? moment(time < 1e10 ? time * 1000 : time)
    : time;
  // TODO is forceUtc ever used? In which context?
  if (forceUtc) {
    wrapper.utc();
  }
  return wrapper.format('LT');
};

LocalTime.displayName = 'LocalTime';

LocalTime.propTypes = {
  forceUtc: PropTypes.bool,
  time: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
};

LocalTime.defaultProps = {
  forceUtc: false,
};

export default LocalTime;
