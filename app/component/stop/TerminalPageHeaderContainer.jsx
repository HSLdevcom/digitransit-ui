import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay';

import StopPageHeader from './StopPageHeader';

const TerminalPageHeader = props => <StopPageHeader {...props} isTerminal />;

TerminalPageHeader.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  station: PropTypes.object,
};

export default createFragmentContainer(TerminalPageHeader, {
  station: graphql`
    fragment TerminalPageHeaderContainer_station on Stop {
      ...StopCardHeaderContainer_stop
    }
  `,
});
