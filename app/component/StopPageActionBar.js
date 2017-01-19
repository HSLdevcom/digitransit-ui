import React, { PropTypes } from 'react';
import ExternalLink from './ExternalLink';

const StopPageActionBar = ({ printUrl }) => {
  console.log('url', printUrl);
  return (
    <div id="stop-page-action-bar">
      <ExternalLink className="external" name="Tulosta" href={printUrl} />
    </div>);
};

StopPageActionBar.displayName = 'StopPageActionBar';

StopPageActionBar.description = () =>
  <div />;

StopPageActionBar.propTypes = {
  printUrl: PropTypes.string,
};

export default StopPageActionBar;
