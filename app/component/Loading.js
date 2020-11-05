import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ContainerSpinner from '@hsl-fi/container-spinner';

const defaultMessage = (
  <span className="sr-only" aria-busy="true" aria-live="polite">
    <FormattedMessage id="loading" defaultMessage="Loading" />
  </span>
);

const Loading = props => {
  return (
    <ContainerSpinner visible>
      {(props && props.children) || defaultMessage}
    </ContainerSpinner>
  );
};

Loading.displayName = 'Loading';
Loading.propTypes = {
  children: PropTypes.node,
};

export default Loading;
