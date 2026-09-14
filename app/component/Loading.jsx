import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Spinner } from '@hsl-fi/loading-indicators';

const defaultMessage = (
  <span className="sr-only" aria-busy="true" aria-live="polite">
    <FormattedMessage id="loading" defaultMessage="Loading" />
  </span>
);

export default function Loading(props) {
  return (
    <div className="loading-spinner-container">
      <Spinner />
      {props?.children || defaultMessage}
    </div>
  );
}

Loading.displayName = 'Loading';

Loading.propTypes = { children: PropTypes.node };
Loading.defaultProps = { children: undefined };
