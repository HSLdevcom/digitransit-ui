import React from 'react';
import PropTypes from 'prop-types';
import { useFragment } from 'react-relay';
import { useRouter } from 'found';
import CanceledDepartures from './CanceledDepartures';
import './PatternWithCancellations.scss';
import CanceledTripsPatternFragment from '../queries/CanceledTripsPatternFragment';
import { patternShape } from '../../../util/shapes';
import EntityBadge from './EntityBadge';
import { PREFIX_TIMETABLE, routePagePath } from '../../../util/path';

const PatternWithCancellations = ({ routeId, pattern: patternRef, mode }) => {
  const pattern = useFragment(CanceledTripsPatternFragment, patternRef);
  const { router } = useRouter();
  const url = routePagePath(routeId, PREFIX_TIMETABLE, pattern.code);

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();
    router.push(url);
  };

  return (
    <div className="pattern-column">
      <EntityBadge
        mode={mode}
        entity={{
          __typename: 'Pattern',
          ...pattern,
        }}
        handleClick={handleClick}
        isPattern
      />
      <CanceledDepartures patterns={[pattern]} />
    </div>
  );
};

PatternWithCancellations.propTypes = {
  routeId: PropTypes.string.isRequired,
  pattern: patternShape.isRequired,
  mode: PropTypes.string,
};

export default PatternWithCancellations;
