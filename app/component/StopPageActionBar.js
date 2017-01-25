import React, { PropTypes } from 'react';
import PrintLink from './PrintLink';

const StopPageActionBar = ({ printUrl, breakpoint }) => (
  printUrl &&
    <div id="stop-page-action-bar">
      {breakpoint === 'large' && <hr className="action-bar" />}
      <PrintLink className="action-bar" href={printUrl} />
    </div>
  );

StopPageActionBar.displayName = 'StopPageActionBar';


StopPageActionBar.propTypes = {
  printUrl: PropTypes.string,
  breakpoint: PropTypes.string,
};

export default StopPageActionBar;
