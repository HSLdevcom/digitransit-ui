import React from 'react';
import Button from '@hsl-fi/button';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import FavouriteRouteContainer from '../../routepage/FavouriteRouteContainer';
import { PREFIX_TIMETABLE, routePagePath } from '../../../util/path';
import Icon from '../../Icon';
import PatternWithCancellations from './PatternWithCancellations';
import RouteBadgeGroup from './RouteBadgeGroup';
import { patternShape, routeShape } from '../../../util/shapes';

const CancellationContainer = ({
  routeSummary,
  mode,
  isMobile,
  colors,
  onShowDetailsClick,
  separator = false,
}) => {
  const {
    route: { shortName, gtfsId },
    patterns,
  } = routeSummary;
  const intl = useIntl();

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
        </div>
        <FavouriteRouteContainer gtfsId={gtfsId} />
      </div>
      <div className="cancellation-container--row">
        <div className="cancellation-container__patterns--column">
          {patterns.map(({ cancellationCount, pattern }) => (
            <React.Fragment key={`${shortName}-${pattern.code}`}>
              <PatternWithCancellations
                cancellationCount={cancellationCount}
                pattern={pattern}
                withDeparturesAmount
              />
            </React.Fragment>
          ))}
        </div>
        {isMobile && (
          <button type="button" onClick={() => onShowDetailsClick(shortName)}>
            <Icon img="icon_arrow-collapse--right" color={colors.primary} />
          </button>
        )}
      </div>

      {!isMobile && (
        <Button
          className="show-departures-button link-bold-small"
          size="small"
          fullWidth={false}
          variant="white"
          value={intl.formatMessage({ id: 'show-departures' })}
          onClick={() => onShowDetailsClick(shortName)}
        />
      )}
      {!isMobile && separator && <div className="separator horizontal" />}
    </div>
  );
};

CancellationContainer.propTypes = {
  routeSummary: PropTypes.shape({
    route: routeShape.isRequired,
    patterns: PropTypes.arrayOf(
      PropTypes.shape({
        pattern: patternShape.isRequired,
        cancellationCount: PropTypes.number.isRequired,
      }),
    ).isRequired,
    cancellationCount: PropTypes.number.isRequired,
  }).isRequired,
  mode: PropTypes.string.isRequired,
  isMobile: PropTypes.bool.isRequired,
  colors: PropTypes.shape({ primary: PropTypes.string }).isRequired,
  onShowDetailsClick: PropTypes.func.isRequired,
  separator: PropTypes.bool,
};

export default CancellationContainer;
