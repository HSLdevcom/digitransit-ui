import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import { legShape, configShape } from '../../util/shapes';
import { legTime, legTimeStr } from '../../util/legUtils';
import NaviLeg from './NaviLeg';
import Icon from '../Icon';
import NaviStack from './NaviStack';
import { getAlerts, getScheduleInfo } from './NaviUtils';

function getFirstLastLegs(legs) {
  const first = legs[0];
  const last = legs[legs.length - 1];
  return { first, last };
}

function NaviTop({ focusToLeg, time, realTimeLegs }, { intl, config }) {
  const [currentLeg, setCurrentLeg] = useState(null);
  const [show, setShow] = useState(true);
  // All notifications including those user has dismissed.
  const [notifications, setNotifications] = useState([]);
  // notifications that are shown to the user.
  const [activeNotifications, setActiveNotifications] = useState([]);
  const focusRef = useRef(false);

  const handleClick = () => {
    setShow(!show);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const newLeg = realTimeLegs.find(leg => {
      return legTime(leg.start) <= time && time <= legTime(leg.end);
    });

    const incomingNotifications = [];

    const alerts = getAlerts(realTimeLegs, intl);
    if (alerts.length > 0) {
      const newAlerts = alerts.filter(
        p => !notifications.find(n => n.id === p.id),
      );
      incomingNotifications.push(...newAlerts);
    }

    const legChanged = newLeg?.id
      ? newLeg.id !== currentLeg?.id
      : currentLeg?.mode !== newLeg?.mode;
    const l = currentLeg || newLeg;
    if (l) {
      const nextLeg = realTimeLegs.find(
        leg => legTime(leg.start) > legTime(l.start),
      );
      if (nextLeg) {
        const i = getScheduleInfo(nextLeg, intl);
        if (i) {
          const found = notifications.find(n => n.id === i.id);
          if (!found) {
            incomingNotifications.push(i);
          }
        }
      }

      if (legChanged) {
        // remove Old main notification when new leg is started.
        // todo: this should be done in a better way.
        setActiveNotifications(nots => nots.filter(n => n.type !== 'main'));
        focusToLeg?.(newLeg);
        setCurrentLeg(newLeg);
      }
      if (incomingNotifications.length > 0) {
        setActiveNotifications(nots => nots.concat(...incomingNotifications));
        setNotifications(nots => nots.concat(...incomingNotifications));
        setShow(true);
      }

      if (!focusRef.current && focusToLeg) {
        // handle initial focus when not tracking
        if (newLeg) {
          focusToLeg(newLeg);
        } else {
          const { first, last } = getFirstLastLegs(realTimeLegs);
          if (time < legTime(first.start)) {
            focusToLeg(first);
          } else {
            focusToLeg(last);
          }
        }
        focusRef.current = true;
      }
    }
  }, [time]);

  const { first, last } = getFirstLastLegs(realTimeLegs);

  let naviTopContent;
  if (time < legTime(first.start)) {
    naviTopContent = (
      <FormattedMessage
        id="navigation-journey-start"
        values={{ time: legTimeStr(first.start) }}
      />
    );
  } else if (currentLeg) {
    if (!currentLeg.transitLeg) {
      const nextLeg = realTimeLegs.find(
        leg => legTime(leg.start) > legTime(currentLeg.start),
      );
      naviTopContent = <NaviLeg leg={currentLeg} nextLeg={nextLeg} />;
    } else {
      naviTopContent = `Tracking ${currentLeg?.mode} leg`;
    }
  } else if (time > legTime(last.end)) {
    naviTopContent = <FormattedMessage id="navigation-journey-end" />;
  } else {
    naviTopContent = <FormattedMessage id="navigation-wait" />;
  }
  const handleRemove = index => {
    setActiveNotifications(activeNotifications.filter((_, i) => i !== index));
  };
  const showNotifications = activeNotifications.length > 0;
  return (
    <>
      <button type="button" className="navitop" onClick={handleClick}>
        <div className="content">{naviTopContent}</div>
        <div type="button" className="navitop-arrow">
          {showNotifications && (
            <Icon
              img="icon-icon_arrow-collapse"
              className={`cursor-pointer ${show ? 'inverted' : ''}`}
              color={config.colors.primary}
            />
          )}
        </div>
      </button>
      {showNotifications && (
        <NaviStack
          notifications={activeNotifications}
          setShow={setShow}
          show={show}
          handleRemove={handleRemove}
        />
      )}
    </>
  );
}

NaviTop.propTypes = {
  focusToLeg: PropTypes.func,
  time: PropTypes.number.isRequired,
  realTimeLegs: PropTypes.arrayOf(legShape).isRequired,
  /*
  focusToPoint: PropTypes.func.isRequired,
  */
};

NaviTop.defaultProps = {
  focusToLeg: undefined,
};

NaviTop.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

export default NaviTop;
