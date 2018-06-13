import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { routerShape, locationShape } from 'react-router';

import Modal from './Modal';
import Loading from './Loading';
import DisruptionListContainer from './DisruptionListContainer';
import ComponentUsageExample from './ComponentUsageExample';
import { isBrowser } from '../util/browser';

function DisruptionInfo(props, context) {
  if (!((props && props.isBrowser) || isBrowser)) {
    return null;
  }

  const isOpen = () =>
    context.location.state ? context.location.state.disruptionInfoOpen : false;
  if (!isOpen()) {
    return null;
  }

  const toggleVisibility = () => {
    if (isOpen()) {
      context.router.goBack();
    } else {
      context.router.push({
        ...context.location,
        state: {
          ...context.location.state,
          disruptionInfoOpen: true,
        },
      });
    }
  };

  return (
    <Modal
      open
      title={
        <FormattedMessage
          id="disruption-info"
          defaultMessage="Disruption info"
        />
      }
      toggleVisibility={toggleVisibility}
    >
      <Relay.RootContainer
        Component={DisruptionListContainer}
        forceFetch
        route={{
          name: 'ViewerRoute',
          queries: {
            root: (Component, { feedIds }) => Relay.QL`
                query {
                  viewer {
                    ${Component.getFragment('root', { feedIds })}
                  }
                }
             `,
          },
          params: { feedIds: context.config.feedIds },
        }}
        renderLoading={() => <Loading />}
      />
    </Modal>
  );
}

DisruptionInfo.contextTypes = {
  router: routerShape.isRequired, // eslint-disable-line react/no-typos
  location: locationShape.isRequired, // eslint-disable-line react/no-typos
  config: PropTypes.shape({
    feedIds: PropTypes.arrayOf(PropTypes.string.isRequired),
  }).isRequired,
};

DisruptionInfo.propTypes = {
  isBrowser: PropTypes.bool,
};

DisruptionInfo.defaultProps = {
  isBrowser: false,
};

DisruptionInfo.description = () => (
  <div>
    <p>
      Modal that shows all available disruption info. Opened by
      DisruptionInfoButton.
      <strong>Deprecated:</strong> Will be removed in short future in favor of
      announcements page.
    </p>
    <ComponentUsageExample>
      <DisruptionInfo />
    </ComponentUsageExample>
  </div>
);

export default DisruptionInfo;
