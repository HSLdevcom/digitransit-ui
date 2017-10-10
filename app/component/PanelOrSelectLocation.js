import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import OriginSelector from './OriginSelector';
import { dtLocationShape } from '../util/shapes';

const PanelOrSelectLocation = ({ panel, location, panelctx }) => {
  if (location.lat && location.lon) {
    return React.createElement(panel, panelctx);
  }
  return (
    <div className="frontpage-panel">
      <div id="nolocation-panel" key="contents" className="flex-vertical">
        <p>
          <FormattedMessage
            id="splash-choose"
            defaultMessage="Select your origin"
          />
        </p>
        <OriginSelector />
      </div>
    </div>
  );
};

PanelOrSelectLocation.propTypes = {
  panel: PropTypes.element.isRequired,
  location: dtLocationShape.isRequired,
  panelctx: PropTypes.object.isRequired,
};

export default PanelOrSelectLocation;
