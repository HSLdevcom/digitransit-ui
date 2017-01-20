import React, { PropTypes } from 'react';
import ExternalLink from './ExternalLink';
import Icon from './Icon';

const StopPageActionBar = ({ printUrl }) => (
  printUrl &&
  <div id="stop-page-action-bar">
    <ExternalLink className="action-bar" href={printUrl} >
      <Icon img="icon-icon_print" /> Tulosta
    </ExternalLink>
  </div>);

StopPageActionBar.displayName = 'StopPageActionBar';

StopPageActionBar.description = () =>
  <div />;

StopPageActionBar.propTypes = {
  printUrl: PropTypes.string,
};

export default StopPageActionBar;
