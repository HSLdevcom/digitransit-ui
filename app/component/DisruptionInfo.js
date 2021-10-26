import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { graphql, QueryRenderer, ReactRelayContext } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';
import LazilyLoad, { importLazy } from './LazilyLoad';
import Loading from './Loading';
import DisruptionListContainer from './DisruptionListContainer';
import { isBrowser } from '../util/browser';

function DisruptionInfo(props, context) {
  const { environment } = useContext(ReactRelayContext);
  if (!isBrowser) {
    return null;
  }

  const isOpen = () =>
    context.match.location.state
      ? context.match.location.state.disruptionInfoOpen
      : false;
  if (!isOpen()) {
    return null;
  }

  const toggleVisibility = () => {
    if (isOpen()) {
      context.router.go(-1);
    } else {
      context.router.push({
        ...context.match.location,
        state: {
          ...context.match.location.state,
          disruptionInfoOpen: true,
        },
      });
    }
  };

  const disruptionModalModules = {
    Modal: () => importLazy(import('./Modal')),
  };

  const renderContent = Modal => (
    <Modal
      disableScrolling
      open
      title={
        <FormattedMessage
          id="disruption-info"
          defaultMessage="Disruption info"
        />
      }
      toggleVisibility={toggleVisibility}
    >
      <QueryRenderer
        cacheConfig={{ force: true, poll: 30 * 1000 }}
        query={graphql`
          query DisruptionInfoQuery($feedIds: [String!]) {
            viewer {
              ...DisruptionListContainer_viewer @arguments(feedIds: $feedIds)
            }
          }
        `}
        variables={{ feedIds: context.config.feedIds }}
        environment={environment}
        render={({ props: innerProps }) =>
          innerProps ? <DisruptionListContainer {...innerProps} /> : <Loading />
        }
      />
    </Modal>
  );

  return (
    <React.Fragment>
      <LazilyLoad modules={disruptionModalModules}>
        {({ Modal }) => renderContent(Modal)}
      </LazilyLoad>
    </React.Fragment>
  );
}

DisruptionInfo.contextTypes = {
  router: routerShape.isRequired, // eslint-disable-line react/no-typos
  match: matchShape.isRequired,
  config: PropTypes.shape({
    feedIds: PropTypes.arrayOf(PropTypes.string.isRequired),
  }).isRequired,
};

DisruptionInfo.propTypes = {};

export default DisruptionInfo;
