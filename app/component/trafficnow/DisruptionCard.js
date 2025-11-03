import React, { useState } from 'react';
import cx from 'classnames';
import { useFragment } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import Button from '@hsl-fi/button';
import Card from '../Card';
import { alertShape } from '../../util/shapes';
import Icon from '../Icon';
import { useConfigContext } from '../../configurations/ConfigContext';
import Badge from '../Badge';
import DisruptionCardFragment from './queries/DisruptionCardFragment';
import RouteBadges from './RouteBadges';
import { getFormattedTimeDate } from '../../util/timeUtils';

const DATE_FORMAT = 'd.L.yyyy';

const handleExtraInfoClick = url => e => {
  e.stopPropagation();
  window.location.href = url;
};

export default function DisruptionCard({ alert }) {
  const {
    alertSeverityLevel,
    alertEffect,
    alertHeaderText,
    entities,
    alertDescriptionText,
    effectiveStartDate,
    effectiveEndDate,
    alertUrl,
  } = useFragment(DisruptionCardFragment, alert);
  const [isOpen, setOpen] = useState(false);
  const { colors } = useConfigContext();

  const now = Date.now();
  const isValid =
    now > effectiveStartDate * 1000 && now < effectiveEndDate * 1000;

  const validityPeriod = `${getFormattedTimeDate(
    effectiveStartDate * 1000,
    DATE_FORMAT,
  )} - ${getFormattedTimeDate(effectiveEndDate * 1000, DATE_FORMAT)}`;

  return (
    <Card
      className="traffic-now__disruption-card"
      onClick={() => setOpen(!isOpen)}
    >
      <div className="traffic-now__disruption-card__top-row">
        <Badge showIcon variant={alertSeverityLevel} label={alertEffect} />
        <button type="button">
          <Icon
            img="icon_arrow-dropdown"
            color={colors.primary}
            className={cx('traffic-now__disruption-card__icon', {
              'traffic-now__disruption-card__icon--inverted': isOpen,
            })}
          />
        </button>
      </div>
      {entities && (
        <RouteBadges
          entities={entities}
          className="traffic-now__disruption-card__route-badges"
        />
      )}
      <h2>{alertHeaderText}</h2>
      <div
        className={cx('traffic-now__disruption-card__content', {
          'traffic-now__disruption-card__content--open': isOpen,
        })}
      >
        <p>{alertDescriptionText}</p>
      </div>
      <div className="traffic-now__disruption-card__bottom-row">
        <div className="traffic-now__disruption-card__bottom-row-validity">
          <div className="traffic-now__disruption-card__bottom-row-validity-icon">
            {isValid ? (
              <>
                <Icon img="icon_clock" />
                <FormattedMessage id="valid" default="Active" />
              </>
            ) : (
              <>
                <Icon img="icon_calendar" />
                <FormattedMessage id="upcoming" default="Upcoming" />
              </>
            )}
          </div>
          <div className="separator vertical" />
          {validityPeriod}
        </div>
        {alertUrl && isOpen && (
          <div className="traffic-now__disruption-card__bottom-row-info">
            <Button
              size="small"
              fullWidth
              variant="white"
              value={<FormattedMessage id="extra-info" default="Details" />}
              onClick={handleExtraInfoClick(alertUrl)}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

DisruptionCard.propTypes = { alert: alertShape.isRequired };
DisruptionCard.defaultProps = {};
