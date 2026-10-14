import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Link from 'found/Link';
import { useMatch } from 'found';
import Icon from './Icon';

const NetworkError = ({ retry }) => {
  const match = useMatch();
  return (
    <div className="page-not-found">
      <Icon img="icon_error_page_not_found" />
      <p>
        <FormattedMessage
          id="network-error"
          defaultMessage="There was a network error"
        />
      </p>
      <p>
        <Link to={match.location} onClick={retry}>
          <FormattedMessage id="try-again" defaultMessage="Try again ›" />
        </Link>
      </p>
    </div>
  );
};

NetworkError.propTypes = { retry: PropTypes.func.isRequired };

export default NetworkError;
