import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';

/**
 * Returns a valid react-relay classic context that can be used for unit testing.
 *
 * @param {*} variables Any relay variables that should be applied, defaults to {}.
 * @param {*} params Any route params that should be applied, defaults to variables.
 */
export const getRelayContextMock = (variables = {}, params = variables) => ({
  relay: {
    environment: Relay.Store,
    variables: { ...variables },
  },
  route: {
    name: '',
    params: { ...params },
    queries: {},
  },
});

export const mockRelayChildContextTypes = {
  relay: PropTypes.object,
  route: PropTypes.object,
};
