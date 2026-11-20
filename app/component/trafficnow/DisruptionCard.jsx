import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Text } from '@hsl-fi/layout-primitives';
import { AlertSeverityLevelType } from '../../../utils/shared/constants';
import { alertShape } from '../../../utils/client/shapes';
import DisruptionCardShell from './DisruptionCardShell';
import DisruptionBadge from './DisruptionBadge';
import DisruptionStatus from './components/DisruptionStatus';
import RouteBadges from './RouteBadges';
import OperatorBadge from './components/OperatorBadge';

export default function DisruptionCard({
  alert,
  onClick = () => {},
  isMobile = false,
  mode,
  cardKey,
}) {
  const intl = useIntl();
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
    <DisruptionCardShell
      cardKey={cardKey}
      onOpen={() => onClick(id)}
      ariaLabel={[alertHeaderText, intl.formatMessage({ id: 'disruption-view-details' })]
        .filter(Boolean)
        .join(', ')}
      headerLeft={
        <>
          <DisruptionBadge showIcon variant={alertSeverityLevel} label={alertEffect} />
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
        </>
      }
    >
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
    </DisruptionCardShell>
  );
}

DisruptionCard.propTypes = {
  alert: alertShape.isRequired,
  onClick: PropTypes.func,
  isMobile: PropTypes.bool,
  mode: PropTypes.string,
  cardKey: PropTypes.string,
};
