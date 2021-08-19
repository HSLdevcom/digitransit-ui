import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { FormattedMessage } from 'react-intl';

import OriginDestinationBar from './OriginDestinationBar';
import QuickSettingsPanel from './QuickSettingsPanel';
import { isBrowser } from '../util/browser';
import { parseLocation, PREFIX_ITINERARY_SUMMARY } from '../util/path';
import withBreakpoint from '../util/withBreakpoint';
import BackButton from './BackButton';

class SummaryNavigation extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      from: PropTypes.string,
      to: PropTypes.string,
      hash: PropTypes.string,
    }).isRequired,
    startTime: PropTypes.number,
    endTime: PropTypes.number,
    breakpoint: PropTypes.string.isRequired,
    serviceTimeRange: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }).isRequired,
    toggleSettings: PropTypes.func.isRequired,
    scrolled: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    startTime: null,
    endTime: null,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    router: routerShape,
    match: matchShape.isRequired,
  };

  componentDidMount() {
    this.unlisten = this.context.router.addNavigationListener(location => {
      if (
        this.context.match.location.state &&
        this.context.match.location.state.customizeSearchOffcanvas &&
        (!location.state || !location.state.customizeSearchOffcanvas) &&
        !this.transitionDone &&
        location.pathname.startsWith(`/${PREFIX_ITINERARY_SUMMARY}/`)
      ) {
        this.transitionDone = true;
        const newLocation = {
          ...this.context.match.location,
          state: {
            ...this.context.match.location.state,
            customizeSearchOffcanvas: false,
          },
        };
        setTimeout(() => this.context.router.replace(newLocation), 0);
      } else {
        this.transitionDone = false;
      }
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    const className = cx({ 'bp-large': this.props.breakpoint === 'large' });
    return (
      <div
        className={cx('summary-navigation-container', {
          'summary-navigation-container-scrolled': this.props.scrolled,
        })}
      >
        {this.props.breakpoint !== 'large' && (
          <BackButton
            title={
              <FormattedMessage
                id="summary-page.title"
                defaultMessage="Itinerary suggestions"
              />
            }
            icon="icon-icon_arrow-collapse--left"
            iconClassName="arrow-icon"
            fallback={
              this.props.params.hash === 'bikeAndVehicle' ? 'pop' : undefined
            }
          />
        )}
        <span className="sr-only">
          <FormattedMessage
            id="search-fields.sr-instructions"
            defaultMessage="The search is triggered automatically when origin and destination are set. Changing any search parameters triggers a new search"
          />
        </span>
        <OriginDestinationBar
          className={className}
          origin={parseLocation(this.props.params.from)}
          destination={parseLocation(this.props.params.to)}
          isMobile={this.props.breakpoint !== 'large'}
        />
        {isBrowser && (
          <React.Fragment>
            <QuickSettingsPanel
              timeSelectorStartTime={this.props.startTime}
              timeSelectorEndTime={this.props.endTime}
              timeSelectorServiceTimeRange={this.props.serviceTimeRange}
              toggleSettings={this.props.toggleSettings}
            />
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default withBreakpoint(SummaryNavigation);
