import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import Icon from '../../Icon';
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
        <Icon img="icon_map-location" />
        <span className="tag-bold">{area}</span>
      </div>
    )
  );
}

OperatorBadge.propTypes = {
  feed: PropTypes.string,
};

export default OperatorBadge;
