import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { matchShape, routerShape } from 'found';
import cx from 'classnames';
import RouteStopListContainer from './RouteStopListContainer';
import withBreakpoint from '../util/withBreakpoint';
import RoutePageControlPanel from './RoutePageControlPanel';
import { isBrowser } from '../util/browser';
import { PREFIX_ROUTES } from '../util/path';
import Error404 from './404';
import ScrollableWrapper from './ScrollableWrapper';

class PatternStopsContainer extends React.PureComponent {
  static propTypes = {
    pattern: PropTypes.shape({
      code: PropTypes.string.isRequired,
    }).isRequired,
    match: matchShape.isRequired,
    breakpoint: PropTypes.string.isRequired,
    router: routerShape.isRequired,
    route: PropTypes.object.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  render() {
    if (!this.props.pattern) {
      if (isBrowser) {
        if (this.props.route.gtfsId) {
          // Redirect back to routes default pattern
          this.props.router.replace(
            `/${PREFIX_ROUTES}/${this.props.route.gtfsId}`,
          );
        } else {
          return <Error404 />;
        }
      }
      return false;
    }
    return (
      <>
        <ScrollableWrapper
          className={cx('route-page-content', {
            'bp-large': this.props.breakpoint === 'large',
          })}
        >
          {this.props.route && this.props.route.patterns && (
            <RoutePageControlPanel
              match={this.props.match}
              route={this.props.route}
              breakpoint={this.props.breakpoint}
            />
          )}
          <RouteStopListContainer
            key="list"
            pattern={this.props.pattern}
            patternId={this.props.pattern.code}
          />
        </ScrollableWrapper>
      </>
    );
  }
}

export default createFragmentContainer(withBreakpoint(PatternStopsContainer), {
  pattern: graphql`
    fragment PatternStopsContainer_pattern on Pattern
    @argumentDefinitions(
      currentTime: { type: "Long!", defaultValue: 0 }
      patternId: { type: "String!", defaultValue: "0" }
    ) {
      code
      ...RouteStopListContainer_pattern
      @arguments(currentTime: $currentTime, patternId: $patternId)
    }
  `,
  route: graphql`
    fragment PatternStopsContainer_route on Route
    @argumentDefinitions(date: { type: "String" }) {
      gtfsId
      color
      shortName
      longName
      mode
      type
      ...RouteAgencyInfo_route
      ...RoutePatternSelect_route @arguments(date: $date)
      alerts {
        alertSeverityLevel
        effectiveEndDate
        effectiveStartDate
        trip {
          pattern {
            code
          }
        }
      }
      agency {
        phone
      }
      patterns {
        headsign
        code
        stops {
          id
          gtfsId
          code
          alerts {
            id
            alertDescriptionText
            alertHash
            alertHeaderText
            alertSeverityLevel
            alertUrl
            effectiveEndDate
            effectiveStartDate
            alertDescriptionTextTranslations {
              language
              text
            }
            alertHeaderTextTranslations {
              language
              text
            }
            alertUrlTranslations {
              language
              text
            }
          }
        }
        trips: tripsForDate(serviceDate: $date) {
          stoptimes: stoptimesForDate(serviceDate: $date) {
            realtimeState
            scheduledArrival
            scheduledDeparture
            serviceDay
          }
        }
        activeDates: trips {
          serviceId
          day: activeDates
        }
      }
    }
  `,
});
