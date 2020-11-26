import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import CarpoolOffer from './CarpoolOffer';

const CarpoolDrawer = ({ open, onToggleClick, mobile, carLeg }) => {
  if (open && carLeg) {
    return (
      <div className={`offcanvas${mobile ? '-mobile' : ''}`}>
        <CarpoolOffer
          onToggleClick={onToggleClick}
          start={carLeg.startTime}
          leg={carLeg}
        />
      </div>
    );
  }
  return null;
};

CarpoolDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onToggleClick: PropTypes.func.isRequired,
  mobile: PropTypes.bool,
  carLeg: PropTypes.object,
};

CarpoolDrawer.defaultProps = {
  mobile: false,
};

CarpoolDrawer.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default CarpoolDrawer;
