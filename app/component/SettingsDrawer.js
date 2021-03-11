import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import CustomizeSearch from './CustomizeSearchNew';
import MapLayersDialogContent from './MapLayersDialogContent';

export const SettingsDrawer = (
  { open, onToggleClick, mobile, settingsType, setOpen },
  context,
) => {
  if (open && !settingsType) {
    return (
      <div className={`offcanvas${mobile ? '-mobile' : ''}`}>
        <CustomizeSearch onToggleClick={onToggleClick} mobile={mobile} />
      </div>
    );
  }
  if (open && settingsType && settingsType === 'MapLayer') {
    return (
      <div className="offcanvas-layers">
        <MapLayersDialogContent open={open} setOpen={setOpen} />
        <button className="desktop-button" onClick={() => setOpen(false)}>
          {context.intl.formatMessage({ id: 'close', defaultMessage: 'Close' })}
        </button>
      </div>
    );
  }
  return null;
};

SettingsDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onToggleClick: PropTypes.func.isRequired,
  mobile: PropTypes.bool,
  settingsType: PropTypes.string,
  setOpen: PropTypes.func,
};

SettingsDrawer.defaultProps = {
  mobile: false,
  settingsType: undefined,
  setOpen: undefined,
};

SettingsDrawer.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default SettingsDrawer;
