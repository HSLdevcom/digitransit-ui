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

export const RouteShape = PropTypes.shape({
  gtfsId: PropTypes.string,
  mode: PropTypes.string,
  shortName: PropTypes.string,
  color: PropTypes.string,
  type: PropTypes.number,
});

/**
 * Describes the type information for an OTP Service Alert object.
 */
export const ServiceAlertShape = PropTypes.shape({
  alertDescriptionText: PropTypes.string,
  alertDescriptionTextTranslations: PropTypes.arrayOf(
    PropTypes.shape({
      language: PropTypes.string,
      text: PropTypes.string,
    }),
  ),
  alertHash: PropTypes.number,
  alertHeaderText: PropTypes.string,
  alertHeaderTextTranslations: PropTypes.arrayOf(
    PropTypes.shape({
      language: PropTypes.string,
      text: PropTypes.string,
    }),
  ),
  alertSeverityLevel: PropTypes.string,
  effectiveEndDate: PropTypes.number,
  effectiveStartDate: PropTypes.number,
});
