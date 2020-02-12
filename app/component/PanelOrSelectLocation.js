import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import OriginSelector from './OriginSelector';
import { dtLocationShape } from '../util/shapes';
import { TAB_FAVOURITES } from '../util/path';

const PanelOrSelectLocation = ({ panel, panelctx }) => {
  if (panelctx.origin.ready || panelctx.tab === TAB_FAVOURITES) {
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
        <OriginSelector
          origin={panelctx.origin}
          destination={panelctx.destination}
          tab={panelctx.tab}
        />
      </div>
    </div>
  );
};

PanelOrSelectLocation.propTypes = {
  panel: PropTypes.func.isRequired,
  panelctx: PropTypes.shape({
    tab: PropTypes.string.isRequired,
    origin: dtLocationShape,
    destination: dtLocationShape,
  }).isRequired,
};

export default PanelOrSelectLocation;
