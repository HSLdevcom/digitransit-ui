import React from 'react';
import PropTypes from 'prop-types';
import FavouriteRouteContainer from '../../routepage/FavouriteRouteContainer.jsx';
import { PREFIX_TIMETABLE, routePagePath } from '../../../util/path.js';
import PatternWithCancellations from './PatternWithCancellations.jsx';
import RouteBadgeGroup from './RouteBadgeGroup.jsx';
import DisruptionBadge from '../DisruptionBadge.jsx';
import { patternShape, routeShape } from '../../../util/shapes.js';

const CancellationContainer = ({ routeSummary, mode }) => {
  const {
    route: { shortName, gtfsId },
    patterns,
  } = routeSummary;

  return (
    <div className="cancellation-container">
      <div className="cancellation-container--row">
        <div className="badges">
          <RouteBadgeGroup
            mode={mode}
            headsignGroupClassName={mode}
            routes={[
              {
                id: shortName,
                name: shortName,
                url: routePagePath(gtfsId, PREFIX_TIMETABLE),
                gtfsId,
              },
            ]}
          />
          <DisruptionBadge showIcon variant="WARNING" label="CANCELLATION" />
        </div>
        <FavouriteRouteContainer gtfsId={gtfsId} />
      </div>
      <div className="cancellation-container--row">
        <div className="cancellation-container__patterns--column">
          {patterns.map(({ pattern }) => (
            <React.Fragment key={`${shortName}-${pattern.code}`}>
              <PatternWithCancellations
                routeId={gtfsId}
                mode={mode}
                pattern={pattern}
                summarize={false}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

CancellationContainer.propTypes = {
  routeSummary: PropTypes.shape({
    route: routeShape.isRequired,
    patterns: PropTypes.arrayOf(
      PropTypes.shape({
        pattern: patternShape.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  mode: PropTypes.string.isRequired,
};

export default CancellationContainer;
