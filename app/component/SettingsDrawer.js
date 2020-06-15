import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import CustomizeSearch from './CustomizeSearchNew';

export const SettingsDrawer = ({ open, onToggleClick, mobile }) => {
  if (open) {
    return (
      <div className={`offcanvas${mobile ? '-mobile' : ''}`}>
        <CustomizeSearch onToggleClick={onToggleClick} mobile={mobile} />
      </div>
    );
  }
  return null;
};

SettingsDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onToggleClick: PropTypes.func.isRequired,
  mobile: PropTypes.bool,
};

SettingsDrawer.defaultProps = {
  mobile: false,
};

SettingsDrawer.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default SettingsDrawer;
