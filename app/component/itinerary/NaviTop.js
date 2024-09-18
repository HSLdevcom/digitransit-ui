import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import { itineraryShape, legShape } from '../../util/shapes';
import { legTime, legTimeStr } from '../../util/legUtils';
import NaviLeg from './NaviLeg';

function NaviTop({
  itinerary,
  currentLeg,
  time,
  canceled,
  transferProblem,
  realTimeLegs,
}) {
  const first = realTimeLegs[0];
  const last = realTimeLegs[realTimeLegs.length - 1];

  let info;
  if (time < legTime(first.start)) {
    info = (
      <FormattedMessage
        id="navigation-journey-start"
        values={{ time: legTimeStr(first.start) }}
      />
    );
  } else if (currentLeg) {
    if (!currentLeg.transitLeg) {
      const next = itinerary.legs.find(
        leg => legTime(leg.start) > legTime(currentLeg.start),
      );
      info = <NaviLeg leg={currentLeg} nextLeg={next} />;
    } else {
      info = `Tracking ${currentLeg?.mode} leg`;
    }
  } else if (time > legTime(last.end)) {
    info = <FormattedMessage id="navigation-journey-end" />;
  } else {
    info = <FormattedMessage id="navigation-wait" />;
  }

  return (
    <div className="navitop">
      {canceled && (
        <div className="notifiler">Osa matkan lähdöistä on peruttu</div>
      )}
      {transferProblem && (
        <div className="notifiler">{`Vaihto  ${transferProblem[0].route.shortName} - ${transferProblem[1].route.shortName} ei onnistu reittisuunnitelman mukaisesti`}</div>
      )}
      <div className="info">{info}</div>
    </div>
  );
}

NaviTop.propTypes = {
  itinerary: itineraryShape.isRequired,
  currentLeg: legShape,
  time: PropTypes.number.isRequired,
  canceled: legShape,
  transferProblem: PropTypes.arrayOf(legShape),
  realTimeLegs: PropTypes.arrayOf(legShape).isRequired,
  /*
  focusToPoint: PropTypes.func.isRequired,
  */
};

NaviTop.contextTypes = {
  intl: intlShape.isRequired,
};

NaviTop.defaultProps = {
  canceled: undefined,
  transferProblem: undefined,
  currentLeg: undefined,
};
export default NaviTop;
