import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { graphql, QueryRenderer, ReactRelayContext } from 'react-relay';
import { intlShape } from 'react-intl';
import LazilyLoad, { importLazy } from './LazilyLoad';
import Loading from './Loading';
import DisruptionListContainer from './DisruptionListContainer';
import { isBrowser } from '../util/browser';

function DisruptionInfo(props, context) {
  const { setOpen } = props;
  const { intl } = context;
  const { environment } = useContext(ReactRelayContext);
  if (!isBrowser) {
    return null;
  }

  const disruptionModalModules = {
    Modal: () => importLazy(import('@hsl-fi/modal')),
  };

  const renderContent = Modal => (
    <Modal
      appElement="#app"
      closeButtonLabel={intl.formatMessage({ id: 'close' })}
      contentLabel={intl.formatMessage({
        id: 'disruption-info',
        defaultMessage: 'Disruption info',
      })}
      isOpen
      onCrossClick={() => setOpen(false)}
      onClose={() => setOpen(false)}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
    >
      <div className="momentum-scroll" style={{ maxHeight: '80vh' }}>
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
            innerProps ? (
              <>
                <h2>
                  {intl.formatMessage({
                    id: 'disruption-info',
                    defaultMessage: 'Disruption info',
                  })}
                </h2>
                <DisruptionListContainer {...innerProps} />
              </>
            ) : (
              <Loading />
            )
          }
        />
      </div>
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

DisruptionInfo.propTypes = {
  setOpen: PropTypes.func.isRequired,
};

DisruptionInfo.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.shape({
    feedIds: PropTypes.arrayOf(PropTypes.string.isRequired),
  }).isRequired,
};

DisruptionInfo.propTypes = {};

export default DisruptionInfo;
