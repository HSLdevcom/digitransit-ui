import React, { useState } from 'react';
import cx from 'classnames';
import { useFragment } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import Card from '../Card';
import { alertShape } from '../../util/shapes';
import Icon from '../Icon';
import { useConfigContext } from '../../configurations/ConfigContext';
import Badge from '../Badge';
import DisruptionCardFragment from './queries/DisruptionCardFragment';
import RouteBadges from './RouteBadges';
import { getFormattedTimeDate } from '../../util/timeUtils';

const DATE_FORMAT = 'd.L.yyyy';

export default function DisruptionCard({ alert }) {
  const {
    alertSeverityLevel,
    alertEffect,
    alertHeaderText,
    entities,
    alertDescriptionText,
    effectiveStartDate,
    effectiveEndDate,
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
    <Card className="traffic-now__disruption-card">
      <div className="traffic-now__disruption-card__top-row">
        <Badge showIcon variant={alertSeverityLevel} label={alertEffect} />
        <button type="button" onClick={() => setOpen(!isOpen)}>
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
      {isOpen && <p>{alertDescriptionText}</p>}
      <div className="traffic-now__disruption-card__validity">
        {isValid && (
          <>
            <div className="traffic-now__disruption-card__validity__valid">
              <Icon img="icon_clock" />
              <FormattedMessage id="valid" default="Active" />
            </div>
            <div className="separator vertical" />
          </>
        )}
        {validityPeriod}
      </div>
    </Card>
  );
}

DisruptionCard.propTypes = { alert: alertShape.isRequired };
DisruptionCard.defaultProps = {};
