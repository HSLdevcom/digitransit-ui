import PropTypes from 'prop-types';

export const FareShape = PropTypes.shape({
  agency: PropTypes.shape({
    fareUrl: PropTypes.string,
    name: PropTypes.string,
  }),
  fareId: PropTypes.string,
  cents: PropTypes.number,
  isUnknown: PropTypes.bool,
  routeName: PropTypes.string,
  ticketName: PropTypes.string,
});

export const PatternShape = PropTypes.shape({
  code: PropTypes.string.isRequired,
  route: PropTypes.shape({
    mode: PropTypes.string,
    type: PropTypes.number,
  }),
});
