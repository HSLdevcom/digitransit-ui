import PropTypes from 'prop-types';
import React from 'react';

import { FormattedMessage } from 'react-intl';
import Link from 'found/lib/Link';
import Icon from './Icon';

const NetworkError = ({ retry }, { location }) => (
  <div className="page-not-found">
    <Icon img="icon-icon_error_page_not_found" />
    <p>
      <FormattedMessage
        id="network-error"
        defaultMessage="There was a network error"
      />
    </p>
    <p>
      <Link to={location} onClick={retry}>
        <FormattedMessage id="try-again" defaultMessage="Try again ›" />
      </Link>
    </p>
  </div>
);

NetworkError.propTypes = { retry: PropTypes.func.isRequired };
NetworkError.contextTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string,
    hash: PropTypes.string,
    state: PropTypes.object,
    query: PropTypes.object,
  }).isRequired,
};

export default NetworkError;
