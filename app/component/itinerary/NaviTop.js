import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import { itineraryShape, legShape } from '../../util/shapes';
import { legTime, legTimeStr } from '../../util/legUtils';
import NaviLeg from './NaviLeg';
import Icon from '../Icon';
import NaviStack from './NaviStack';

function NaviTop({
  itinerary,
  currentLeg,
  time,
  canceled,
  transferProblem,
  realTimeLegs,
}) {
  const [show, setShow] = useState(true);

  const handleClick = () => {
    setShow(!show);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);
  const first = realTimeLegs[0];
  const last = realTimeLegs[realTimeLegs.length - 1];

  let info;
  let nextLeg;
  if (time < legTime(first.start)) {
    info = (
      <FormattedMessage
        id="navigation-journey-start"
        values={{ time: legTimeStr(first.start) }}
      />
    );
  } else if (currentLeg) {
    if (!currentLeg.transitLeg) {
      nextLeg = itinerary.legs.find(
        leg => legTime(leg.start) > legTime(currentLeg.start),
      );
      info = <NaviLeg leg={currentLeg} nextLeg={nextLeg} />;
    } else {
      info = `Tracking ${currentLeg?.mode} leg`;
    }
  } else if (time > legTime(last.end)) {
    info = <FormattedMessage id="navigation-journey-end" />;
  } else {
    info = <FormattedMessage id="navigation-wait" />;
  }

  return (
    <>
      <button type="button" className="navitop" onClick={handleClick}>
        <div className="info">{info}</div>
        <div type="button" className="navitop-arrow">
          {nextLeg && (
            <Icon
              img="icon-icon_arrow-collapse"
              className={`cursor-pointer ${show ? 'inverted' : ''}`}
              color="white"
            />
          )}
        </div>
      </button>
      {nextLeg && (
        <NaviStack
          transferProblem={transferProblem}
          canceled={canceled}
          nextLeg={nextLeg}
          show={show}
        />
      )}
    </>
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
