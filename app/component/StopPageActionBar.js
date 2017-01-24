import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import ExternalLink from './ExternalLink';
import Icon from './Icon';

const StopPageActionBar = ({ printUrl, breakpoint }) => (
  printUrl &&
    <div id="stop-page-action-bar">
      {breakpoint === 'large' && <hr className="action-bar" />}
      <ExternalLink className="action-bar" href={printUrl} >
        <Icon img="icon-icon_print" /> <FormattedMessage id="print" defaultMessage="Print" />
      </ExternalLink>
    </div>
  );

StopPageActionBar.displayName = 'StopPageActionBar';

StopPageActionBar.description = () =>
  <div />;

StopPageActionBar.propTypes = {
  printUrl: PropTypes.string,
  breakpoint: PropTypes.string,
};

export default StopPageActionBar;
