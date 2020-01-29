import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';

const RouteDetails = props => (
  <div className="route-prefer-details">
    <FormattedMessage
      id={props.route.mode.toLowerCase()}
      defaultMessage={props.route.mode.toLowerCase()}
    />
    <span className="route-prefer-details-name">
      {props.route.shortName || props.route.longName}
    </span>
  </div>
);

RouteDetails.propTypes = {
  route: PropTypes.shape({
    shortName: PropTypes.string,
    longName: PropTypes.string,
    mode: PropTypes.string,
  }).isRequired,
};

export default createFragmentContainer(RouteDetails, {
  route: graphql`
    fragment RouteDetails_route on Route {
      shortName
      longName
      mode
    }
  `,
});
