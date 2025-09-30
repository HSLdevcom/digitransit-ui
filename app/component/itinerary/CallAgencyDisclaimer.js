import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import OnDemandInfo from './OnDemandInfo';
import {
  agencyShape,
  routeShape,
  pickupBookingInfoShape,
} from '../../util/shapes';

export default function CallAgencyDisclaimer({
  textId,
  text,
  values,
  href,
  linkText,
  header,
  routeNumber,
  pickupBookingInfo,
  agency,
  route,
  mobile,
}) {
  const [infoOpenState, setInfoOpenState] = useState(false);

  const openOnDemandInfo = () => {
    setInfoOpenState(true);
  };

  const closeOnDemandInfo = () => {
    setInfoOpenState(false);
  };

  if (infoOpenState) {
    return (
      <OnDemandInfo
        routeNumber={routeNumber}
        route={route}
        pickupBookingInfo={pickupBookingInfo}
        agency={agency}
        onClose={closeOnDemandInfo}
        mobile={mobile}
      />
    );
  }

  return (
    <div className="call-agency-disclaimer-container">
      <Icon className="info" img="icon_info" />
      <div className="disclaimer">
        {header && <h3 className="disclaimer-header">{header}</h3>}
        {text || <FormattedMessage id={textId} values={values} />}
        {href && (
          <button
            type="button"
            className="external-link-button"
            onClick={openOnDemandInfo}
          >
            {linkText}
          </button>
        )}
      </div>
    </div>
  );
}

CallAgencyDisclaimer.propTypes = {
  textId: PropTypes.string,
  text: PropTypes.string,
  values: PropTypes.objectOf(PropTypes.string),
  href: PropTypes.string,
  linkText: PropTypes.string,
  header: PropTypes.string,
  routeNumber: PropTypes.node,
  pickupBookingInfo: pickupBookingInfoShape,
  agency: agencyShape,
  route: routeShape.isRequired,
  mobile: PropTypes.bool,
};

CallAgencyDisclaimer.defaultProps = {
  textId: null,
  text: null,
  values: {},
  href: null,
  linkText: null,
  header: null,
  routeNumber: null,
  pickupBookingInfo: null,
  agency: null,
  mobile: false,
};
