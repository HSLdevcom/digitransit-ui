import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { graphql, QueryRenderer, ReactRelayContext } from 'react-relay';
import { intlShape } from 'react-intl';
import Modal from '@hsl-fi/modal';
import Loading from './Loading';
import DisruptionListContainer from './DisruptionListContainer';

export default function DisruptionInfo(props, context) {
  const { setOpen } = props;
  const { intl } = context;
  const { environment } = useContext(ReactRelayContext);

  return (
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
                <DisruptionListContainer
                  onClickLink={() => setOpen(false)}
                  {...innerProps}
                />
              </>
            ) : (
              <Loading />
            )
          }
        />
      </div>
    </Modal>
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
