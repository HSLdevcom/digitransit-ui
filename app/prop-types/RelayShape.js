import PropTypes from 'prop-types';

export default PropTypes.shape({
  refetchConnection: PropTypes.func,
  refetch: PropTypes.func,
  hasMore: PropTypes.func,
  loadMore: PropTypes.func,
  environment: PropTypes.object.isRequired,
});
