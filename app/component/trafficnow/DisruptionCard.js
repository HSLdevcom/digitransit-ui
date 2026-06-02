import React from 'react';
import PropTypes from 'prop-types';
import { useConfigContext } from '../../configurations/ConfigContext';
import { AlertSeverityLevelType } from '../../constants';
import { alertShape } from '../../util/shapes';
import Card from '../Card';
import DisruptionBadge from './DisruptionBadge';
import DisruptionStatus from './components/DisruptionStatus';
import Icon from '../Icon';
import RouteBadges from './RouteBadges';

export default function DisruptionCard({
  alert,
  onClick = () => {},
  isMobile = false,
}) {
  const {
    id,
    alertSeverityLevel,
    alertEffect,
    alertHeaderText,
    entities,
    effectiveStartDate,
    effectiveEndDate,
  } = alert;
  const { colors } = useConfigContext();

  return (
    <Card
      className="disruption-card clickable"
      onClick={() => {
        onClick(id);
      }}
    >
      <header>
        <span className="disruption-card__header-left">
          <DisruptionBadge
            showIcon
            variant={alertSeverityLevel}
            label={alertEffect}
          />
          {!isMobile && (
            <>
              <div className="separator vertical" />
              <DisruptionStatus
                effectiveStartDate={effectiveStartDate}
                effectiveEndDate={effectiveEndDate}
                className="text-xs-bold"
                showDates={alertSeverityLevel !== AlertSeverityLevelType.Info}
              />
            </>
          )}
        </span>
        <button type="button">
          <Icon
            img="icon_arrow-collapse--right"
            color={colors.primary}
            className="disruption-card__icon"
          />
        </button>
      </header>
      {entities && <RouteBadges entities={entities} />}
      <h2 className="cta-small">{alertHeaderText}</h2>
      {isMobile && (
        <DisruptionStatus
          effectiveStartDate={effectiveStartDate}
          effectiveEndDate={effectiveEndDate}
          className="text-xs-bold"
          showDates={alertSeverityLevel !== AlertSeverityLevelType.Info}
        />
      )}
    </Card>
  );
}

DisruptionCard.propTypes = {
  alert: alertShape.isRequired,
  onClick: PropTypes.func,
  isMobile: PropTypes.bool,
};
