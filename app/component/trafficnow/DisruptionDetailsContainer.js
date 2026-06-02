import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { ButtonLink } from '@hsl-fi/layout-primitives';
import Link from 'found/Link';
import { useLazyLoadQuery } from 'react-relay/hooks';
import { useConfigContext } from '../../configurations/ConfigContext';
import Card from '../Card';
import DisruptionBadge from './DisruptionBadge';
import DisruptionStatus from './components/DisruptionStatus';
import RouteBadges from './RouteBadges';
import Icon from '../Icon';
import AlertsQuery from './queries/AlertsQuery';
import { AlertSeverityLevelType } from '../../constants';

const DisruptionDetailsContainer = ({ alertId, isMobile = false }) => {
  const config = useConfigContext();
  const intl = useIntl();
  const { alerts } = useLazyLoadQuery(AlertsQuery, {
    feedIds: config.feedIds,
  });

  const alert = alerts?.find(a => a.id === alertId);

  if (!alert) {
    return (
      <>
        <div className="detail-view__cta-container">
          <Link to="/liikenne" className="cta-small">
            <Icon img="icon_chevron-left" />
            <FormattedMessage id="traffic-now_go-back" />
          </Link>
        </div>
        <div className="disruption-details__empty">
          <FormattedMessage
            id="disruption-not-found"
            defaultMessage="Disruption not found"
          />
        </div>
      </>
    );
  }

  const {
    alertSeverityLevel,
    alertEffect,
    alertHeaderText,
    alertDescriptionText,
    effectiveStartDate,
    effectiveEndDate,
    alertUrl,
    entities,
  } = alert;

  const checkedUrl =
    alertUrl &&
    (alertUrl.match(/^[a-zA-Z]+:\/\//) ? alertUrl : `http://${alertUrl}`);

  const content = (
    <>
      <div className="disruption-details__header">
        <DisruptionBadge
          showIcon
          variant={alertSeverityLevel}
          label={alertEffect}
        />
        {isMobile && (
          <div className="disruption-details__header-validity">
            <div className="separator vertical" />
            <DisruptionStatus
              effectiveStartDate={effectiveStartDate}
              effectiveEndDate={effectiveEndDate}
              showDates={false}
            />
          </div>
        )}
        {!isMobile && (
          <DisruptionStatus
            effectiveStartDate={effectiveStartDate}
            effectiveEndDate={effectiveEndDate}
            className="routes-s-bold"
            showDates={alertSeverityLevel !== AlertSeverityLevelType.Info}
          />
        )}
      </div>
      <div className="disruption-details__content">
        {entities && (
          <div className="disruption-details__routes">
            <RouteBadges entities={entities} />
          </div>
        )}
        <h2 className="disruption-details__title">{alertHeaderText}</h2>
        <p className="disruption-details__description">
          {alertDescriptionText}
        </p>
        {checkedUrl && (
          <div className="disruption-details__link">
            <ButtonLink
              size="s"
              href={checkedUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              style={{
                minWidth: isMobile ? '100%' : 'none',
              }}
            >
              {intl.formatMessage({
                id: 'extra-info',
                defaultMessage: 'More info',
              })}
            </ButtonLink>
          </div>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <div className="detail-view__cta-container detail-view__cta-container--mobile">
          <Link to="/liikenne" className="cta-small">
            <Icon img="icon_chevron-left" />
            <FormattedMessage id="traffic-now_go-back" />
            <div />
          </Link>
        </div>
        <div className="disruption-details disruption-details--mobile">
          {content}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="detail-view__cta-container">
        <Link to="/liikenne" className="cta-small">
          <Icon img="icon_chevron-left" />
          <FormattedMessage id="traffic-now_go-back" />
        </Link>
      </div>
      <div className="disruption-details__container">
        <Card>{content}</Card>
      </div>
    </>
  );
};

DisruptionDetailsContainer.propTypes = {
  alertId: PropTypes.string.isRequired,
  isMobile: PropTypes.bool,
};

export default DisruptionDetailsContainer;
