import React, { useState } from 'react';
import cx from 'classnames';
import { useFragment } from 'react-relay';
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
    <Card className="flex-column">
      <div className="top-row flex-row">
        <Badge showIcon variant={alertSeverityLevel} label={alertEffect} />
        <button type="button" onClick={() => setOpen(!isOpen)}>
          <Icon
            img="icon_arrow-dropdown"
            color={colors.primary}
            className={cx(isOpen && 'inverted')}
          />
        </button>
      </div>
      <RouteBadges entities={entities} />
      <h2>{alertHeaderText}</h2>
      {isOpen && <p>{alertDescriptionText}</p>}
      <div className="validity flex-row">
        {isValid && (
          <>
            <div className="valid flex-row vertically-centered">
              <Icon img="icon_clock" />
              Voimassa
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
