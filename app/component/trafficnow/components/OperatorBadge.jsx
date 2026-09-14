import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Icon, MapLocation } from '@hsl-fi/icons';
import { Text } from '@hsl-fi/layout-primitives';
import { useConfigContext } from '../../../configurations/ConfigContext';

function OperatorBadge({ feed }) {
  const { sourceForAlertsAndDisruptions } = useConfigContext();
  const { locale } = useIntl();
  const area = sourceForAlertsAndDisruptions?.[feed]
    ? sourceForAlertsAndDisruptions[feed][locale]
    : '';

  return (
    area && (
      <div className="disruption-operator-badge">
        <Icon icon={MapLocation} size="s" color="default" />
        <Text variant="tag-bold">{area}</Text>
      </div>
    )
  );
}

OperatorBadge.propTypes = {
  feed: PropTypes.string,
};

export default OperatorBadge;
