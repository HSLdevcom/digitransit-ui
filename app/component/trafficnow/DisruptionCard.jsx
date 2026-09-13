import React from 'react';
import PropTypes from 'prop-types';
import { ArrowLinkButton } from '@hsl-fi/navigation';
import { Text } from '@hsl-fi/layout-primitives';
import { AlertSeverityLevelType } from '../../constants.js';
import { alertShape } from '../../util/shapes.js';
import Card from '../Card.jsx';
import DisruptionBadge from './DisruptionBadge.jsx';
import DisruptionStatus from './components/DisruptionStatus.jsx';
import RouteBadges from './RouteBadges.jsx';
import OperatorBadge from './components/OperatorBadge.jsx';

export default function DisruptionCard({
  alert,
  onClick = () => {},
  isMobile = false,
  mode = undefined,
}) {
  const {
    id,
    alertSeverityLevel,
    alertEffect,
    alertHeaderText,
    entities,
    effectiveStartDate,
    effectiveEndDate,
    feed,
  } = alert;

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
          <OperatorBadge feed={feed} />
          {!isMobile && (
            <>
              <div className="separator vertical" />
              <DisruptionStatus
                effectiveStartDate={effectiveStartDate}
                effectiveEndDate={effectiveEndDate}
                variant="text-xs-bold"
                showDates={alertSeverityLevel !== AlertSeverityLevelType.Info}
              />
            </>
          )}
        </span>
        <ArrowLinkButton size="m" />
      </header>
      {entities && <RouteBadges entities={entities} mode={mode} compact />}
      <Text variant="cta-small" color="default" as="h2">
        {alertHeaderText}
      </Text>
      {isMobile && (
        <DisruptionStatus
          effectiveStartDate={effectiveStartDate}
          effectiveEndDate={effectiveEndDate}
          variant="text-xs-bold"
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
  mode: PropTypes.string,
};
