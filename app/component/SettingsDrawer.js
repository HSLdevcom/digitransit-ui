import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import CustomizeSearch from './CustomizeSearchNew';

export const SettingsDrawer = ({
  open,
  width,
  onToggleClick,
  settingsParams,
}) => {
  if (open) {
    return (
      <div className="offcanvas" style={{ width }}>
        <CustomizeSearch
          params={settingsParams}
          onToggleClick={onToggleClick}
        />
      </div>
    );
  } else {
    return null;
  }
};

SettingsDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onToggleClick: PropTypes.func.isRequired,
  settingsParams: PropTypes.object.isRequired,
};

SettingsDrawer.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default SettingsDrawer;
