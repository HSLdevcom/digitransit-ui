import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';
import { plan as examplePlan } from './ExampleData';
import ItineraryFeedback from './itinerary-feedback';
import Icon from './Icon';
import { BreakpointConsumer } from '../util/withBreakpoint';

// TODO: sptlit into container and view

class TimeNavigationButtons extends React.Component {
  static propTypes = {
    isEarlierDisabled: PropTypes.bool.isRequired,
    isLaterDisabled: PropTypes.bool.isRequired,
    onEarlier: PropTypes.func.isRequired,
    onLater: PropTypes.func.isRequired,
    onNow: PropTypes.func.isRequired,
  };

  static contextTypes = {
    config: PropTypes.shape({
      itinerary: PropTypes.shape({
        enableFeedback: PropTypes.bool,
        timeNavigation: PropTypes.shape({
          enableButtonArrows: PropTypes.bool,
        }).isRequired,
      }).isRequired,
    }).isRequired,
  };

  static displayName = 'TimeNavigationButtons';

  static description = () => (
    <div>
      <p>
        Shows buttons for changing the itinerary search time to show previous or
        next deaprtures or reset the time.
      </p>
      <ComponentUsageExample>
        <TimeNavigationButtons itineraries={examplePlan.itineraries} />
      </ComponentUsageExample>
    </div>
  );

  render() {
    const { config } = this.context;

    const itineraryFeedback = config.itinerary.enableFeedback ? (
      <ItineraryFeedback />
    ) : null;
    const { enableButtonArrows } = config.itinerary.timeNavigation;
    const leftArrow = enableButtonArrows ? (
      <Icon img="icon-icon_arrow-left" className="cursor-pointer back" />
    ) : null;
    const rightArrow = enableButtonArrows ? (
      <Icon img="icon-icon_arrow-right" className="cursor-pointer back" />
    ) : null;

    return (
      <BreakpointConsumer>
        {breakpoint => (
          <div
            className={cx('time-navigation-buttons', {
              'bp-large': breakpoint === 'large',
            })}
          >
            {itineraryFeedback}
            <button
              className="standalone-btn time-navigation-earlier-btn"
              disabled={this.props.isEarlierDisabled}
              onClick={this.props.onEarlier}
            >
              {leftArrow}
              <FormattedMessage id="earlier" defaultMessage="Earlier" />
            </button>
            <button
              className="standalone-btn time-navigation-now-btn"
              onClick={this.props.onNow}
            >
              <FormattedMessage id="now" defaultMessage="Now" />
            </button>
            <button
              className="standalone-btn time-navigation-later-btn"
              disabled={this.props.isLaterDisabled}
              onClick={this.props.onLater}
            >
              <FormattedMessage id="later" defaultMessage="Later" />
              {rightArrow}
            </button>
          </div>
        )}
      </BreakpointConsumer>
    );
  }
}

export default TimeNavigationButtons;
