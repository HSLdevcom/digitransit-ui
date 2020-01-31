import getContext from 'recompose/getContext';
import PropTypes from 'prop-types';

export default getContext({
  relayEnvironment: PropTypes.object.isRequired,
});
