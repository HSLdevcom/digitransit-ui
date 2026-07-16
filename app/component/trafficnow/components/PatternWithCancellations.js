import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useFragment } from 'react-relay';
import { useConfigContext } from '../../../configurations/ConfigContext';
import Icon from '../../Icon';
import CanceledDepartures from './CanceledDepartures';

import './PatternWithCancellations.scss';
import CanceledTripsPatternFragment from '../queries/CanceledTripsPatternFragment';
import { patternShape } from '../../../util/shapes';

const PatternWithCancellations = ({
  pattern: patternRef,
  cancellationCount,
  withDepartureBadges = false,
  withDeparturesAmount = false,
}) => {
  const { colors } = useConfigContext();
  const pattern = useFragment(CanceledTripsPatternFragment, patternRef);

  const start = pattern.stops[0].name;
  const end = pattern.stops.at(-1).name;
  return (
    <div
      className="pattern-column"
      style={{
        gap: withDepartureBadges ? 'var(--space-xs)' : 'var(--space-xxs)',
      }}
    >
      <div className="pattern-stops">
        <span>{start}</span>
        <Icon img="icon_arrow-right-long" color={colors.primary} />
        <span>{pattern.headsign || end}</span>
      </div>
      {withDeparturesAmount && (
        <div className="routes-s warning">
          <FormattedMessage
            id="traffic-now_canceled-trips--simple"
            values={{ amount: cancellationCount }}
          />
        </div>
      )}
      {withDepartureBadges && <CanceledDepartures patterns={[pattern]} />}
    </div>
  );
};

PatternWithCancellations.propTypes = {
  pattern: patternShape.isRequired,
  cancellationCount: PropTypes.number.isRequired,
  withDepartureBadges: PropTypes.bool,
  withDeparturesAmount: PropTypes.bool,
};

export default PatternWithCancellations;
