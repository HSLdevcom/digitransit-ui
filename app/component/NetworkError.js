import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Link, locationShape } from 'react-router';
import Icon from './Icon';

const NetworkError = ({ retry }, { location }) => (
  <div className="page-not-found">
    <Icon img="icon-icon_error_page_not_found" />
    <p>
      <FormattedMessage id="network-error" defaultMessage="There was a network error" />
    </p>
    <p>
      <Link to={location} onClick={retry}>
        <FormattedMessage id="try-again" defaultMessage="Try again ›" />
      </Link>
    </p>
  </div>
);

NetworkError.propTypes = { retry: React.PropTypes.func.isRequired };
NetworkError.contextTypes = { location: locationShape.isRequired };

export default NetworkError;
