import React from 'react';
import Button from '@hsl-fi/button';
import PropTypes from 'prop-types';
import FavouriteRouteContainer from '../../routepage/FavouriteRouteContainer';
import { PREFIX_TIMETABLE, routePagePath } from '../../../util/path';
import { useTranslationsContext } from '../../../util/useTranslationsContext';
import Icon from '../../Icon';
import PatternWithCancellations from './PatternWithCancellations';
import RouteBadgeGroup from './RouteBadgeGroup';

const CancellationContainer = ({
  item,
  mode,
  isMobile,
  colors,
  onShowDetailsClick,
}) => {
  const { routeShortName, routeGtfsId, patterns, index, total } = item;
  const intl = useTranslationsContext();

  return (
    <div className="cancellation-container">
      <div className="cancellation-container--row">
        <div className="badges">
          <RouteBadgeGroup
            mode={mode}
            headsignGroupClassName={mode}
            routes={[
              {
                id: routeShortName,
                name: routeShortName,
                url: routePagePath(routeGtfsId, PREFIX_TIMETABLE),
                gtfsId: routeGtfsId,
              },
            ]}
          />
        </div>
        <FavouriteRouteContainer gtfsId={routeGtfsId} />
      </div>
      <div className="cancellation-container--row">
        <div className="cancellation-container__patterns--column">
          {Object.entries(patterns).map(([patternCode, pattern]) => (
            <React.Fragment
              key={`${routeShortName}-${patternCode}-${pattern.trip.tripId}`}
            >
              <PatternWithCancellations
                pattern={pattern}
                withDeparturesAmount
              />
            </React.Fragment>
          ))}
        </div>
        {isMobile && (
          <button
            type="button"
            onClick={() => onShowDetailsClick(routeShortName)}
          >
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
          onClick={() => onShowDetailsClick(routeShortName)}
        />
      )}
      {!isMobile && index + 1 < total && (
        <div className="separator horizontal" />
      )}
    </div>
  );
};

CancellationContainer.propTypes = {
  item: PropTypes.shape({
    routeShortName: PropTypes.string,
    routeGtfsId: PropTypes.string,
    patterns: PropTypes.shape({}),
    index: PropTypes.number,
    total: PropTypes.number,
  }).isRequired,
  mode: PropTypes.string.isRequired,
  isMobile: PropTypes.bool.isRequired,
  colors: PropTypes.shape({ primary: PropTypes.string }).isRequired,
  onShowDetailsClick: PropTypes.func.isRequired,
};

export default CancellationContainer;
