import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Link from 'found/Link';
import Icon from './Icon';
import { useConfigContext } from '../configurations/ConfigContext';

export default function Error404({ error }) {
  const config = useConfigContext();

  return (
    <div className="page-not-found">
      <Icon img="icon_error_page_not_found" />
      {!error && (
        <p>
          <FormattedMessage
            id="page-not-found"
            defaultMessage="The page cannot be found."
          />
        </p>
      )}
      {error && (
        <p className="error">
          <FormattedMessage
            id={error.id}
            values={error.values || {}}
            defaultMessage="Error occured."
          />
        </p>
      )}
      <p>
        {config.URL.ROOTLINK ? (
          <a href={config.URL.ROOTLINK}>
            <FormattedMessage
              id="back-to-front-page"
              defaultMessage="Back to front page ›"
            />
          </a>
        ) : (
          <Link to={`/${config.indexPath}`}>
            <FormattedMessage
              id="back-to-front-page"
              defaultMessage="Back to front page ›"
            />
          </Link>
        )}
      </p>
    </div>
  );
}

Error404.propTypes = {
  error: PropTypes.shape({
    id: PropTypes.string,
    // eslint-disable-next-line
    values: PropTypes.object,
  }),
};
