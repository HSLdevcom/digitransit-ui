import React from 'react';
import Button from '@hsl-fi/button';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useConfigContext } from '../../configurations/ConfigContext';
import { AlertSeverityLevelType } from '../../constants';
import { alertShape } from '../../util/shapes';
import { getFormattedTimeDate } from '../../util/timeUtils';
import Card from '../Card';
import DisruptionBadge from './DisruptionBadge';
import Icon from '../Icon';
import RouteBadges from './RouteBadges';

const DATE_FORMAT = 'd.L.yyyy';

const handleExtraInfoClick = url => e => {
  e.stopPropagation();
  window.location.href = url;
};

export default function DisruptionCard({ alert, isOpen, onClick = () => {} }) {
  const {
    id,
    alertSeverityLevel,
    alertEffect,
    alertHeaderText,
    entities,
    alertDescriptionText,
    effectiveStartDate,
    effectiveEndDate,
    alertUrl,
  } = alert;
  const { colors } = useConfigContext();

  const now = Date.now();
  const isValid =
    now > effectiveStartDate * 1000 && now < effectiveEndDate * 1000;

  const startDate = `${getFormattedTimeDate(
    effectiveStartDate * 1000,
    DATE_FORMAT,
  )}`;
  const endDate = `${getFormattedTimeDate(
    effectiveEndDate * 1000,
    DATE_FORMAT,
  )}`;

  return (
    <Card
      className="disruption-card clickable"
      onClick={() => {
        onClick(isOpen ? undefined : id);
      }}
    >
      <header>
        <DisruptionBadge
          showIcon
          variant={alertSeverityLevel}
          label={alertEffect}
        />
        <button type="button">
          <Icon
            img="icon_arrow-collapse--right"
            color={colors.primary}
            className={cx('disruption-card__icon', {
              'disruption-card__icon--inverted': isOpen,
            })}
          />
        </button>
      </header>
      {entities && <RouteBadges entities={entities} />}
      <h2 className="cta-small">{alertHeaderText}</h2>
      <div
        className={cx('disruption-card__body', {
          'disruption-card__body--open': isOpen,
        })}
      >
        <p className="text-xs">{alertDescriptionText}</p>
      </div>
      <div className="disruption-card__body-row">
        <div className="disruption-card__body-row-validity text-xs">
          <div className="disruption-card__body-row-validity-icon">
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
          {alertSeverityLevel !== AlertSeverityLevelType.Info && (
            <>
              <div className="separator vertical" />
              {startDate}
              {startDate !== endDate && ` - ${endDate}`}
            </>
          )}
        </div>
        {alertUrl && isOpen && (
          <div className="disruption-card__body-row-info">
            <Button
              size="small"
              fullWidth
              variant="white"
              value={
                <FormattedMessage id="extra-info" default="Details">
                  {msg => <span className="link-small">{msg}</span>}
                </FormattedMessage>
              }
              onClick={handleExtraInfoClick(alertUrl)}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

DisruptionCard.propTypes = {
  alert: alertShape.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};
