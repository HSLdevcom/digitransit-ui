import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { intlShape, FormattedMessage } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import { locationToOTP } from '../util/otpStrings';
import Icon from './Icon';
import Select from './Select';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';
import { dtLocationShape } from '../util/shapes';
import { navigateTo, PREFIX_ITINERARY_SUMMARY } from '../util/path';
import { isIe, isKeyboardSelectionEvent } from '../util/browser';
import withBreakpoint from '../util/withBreakpoint';

const ItinerarySearchControl = ({ children }) => (
  <div className="itinerary-search-control">{children}</div>
);

/**
 * Launches route search if both origin and destination are set.
 */
class DTAutosuggestPanel extends React.Component {
  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    intl: intlShape.isRequired,
  };

  static propTypes = {
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
    isItinerary: PropTypes.bool,
    isViaPoint: PropTypes.bool,
    originPlaceHolder: PropTypes.string,
    searchType: PropTypes.string,
    viaPointNames: PropTypes.array,
    setviaPointNames: PropTypes.func,
    tab: PropTypes.string,
    addMoreViapoints: PropTypes.func,
    removeViapoints: PropTypes.func,
    updateViaPoints: PropTypes.func,
    toggleViaPoint: PropTypes.func,
    breakpoint: PropTypes.string.isRequired,
  };

  static defaultProps = {
    originPlaceHolder: 'give-origin',
    searchType: 'endpoint',
  };

  constructor(props) {
    super(props);
    this.state = {
      showDarkOverlay: false,
      activeSlackInputs: [],
    };
  }

  getSlackTimeOptions = () => {
    const timeOptions = [];
    for (let i = 0; i <= 9; i++) {
      const value = i * 10;
      timeOptions.push({
        displayName: `${i}`,
        displayNameObject: `${value} ${this.context.intl.formatMessage({
          id: 'minute-short',
        })}`,
        value,
      });
    }
    return timeOptions;
  };

  value = location =>
    (location && location.address) ||
    (location && location.gps && location.ready && 'Nykyinen sijainti') ||
    '';

  class = location =>
    location && location.gps === true ? 'position' : 'location';

  isFocused = val => {
    this.setState({ showDarkOverlay: val });
  };

  updateViaPointSlack = (activeSlackInputs, viaPointIndexToRemove) => {
    const foundAtIndex = activeSlackInputs.indexOf(viaPointIndexToRemove);
    if (foundAtIndex > -1) {
      activeSlackInputs.splice(foundAtIndex, 1);
    }
    return activeSlackInputs.map(
      value => (value > viaPointIndexToRemove ? value - 1 : value),
    );
  };

  toggleSlackInput = viaPointIndex => {
    const { activeSlackInputs } = this.state;
    this.setState({
      activeSlackInputs: activeSlackInputs.includes(viaPointIndex)
        ? this.updateViaPointSlack(activeSlackInputs, viaPointIndex)
        : activeSlackInputs.concat([viaPointIndex]),
    });
  };

  checkInputForViapoint = (item, i) => {
    // Check if the name exists in viapoints already or not
    if (
      this.props.viaPointNames.filter(o2 => o2 === item.address).length === 0
    ) {
      const arrayCheck = this.props.viaPointNames.map(
        o =>
          o !== ' '
            ? locationToOTP({
                lat: o.split('::')[1].split(',')[0],
                lon: o.split('::')[1].split(',')[1],
                address: o.split('::')[0],
              })
            : o,
      );

      const itemToAdd = locationToOTP({
        lat: item.lat,
        lon: item.lon,
        address: item.address,
      });
      // Check if the viapoint is being edited or a new one is being added
      // Also replace the initial empty placeholder space
      if (
        arrayCheck.filter((o, index) => index !== i).length === 0 &&
        (arrayCheck.length > 2 && arrayCheck[1] !== ' ')
      ) {
        arrayCheck.splice(i, 0, itemToAdd);
      } else {
        arrayCheck.splice(i, 1, itemToAdd);
      }
      const addedViapoints = arrayCheck;

      this.props.updateViaPoints(addedViapoints.filter(o => o !== ' '));
      this.props.setviaPointNames(addedViapoints);
    }
  };

  handleRemoveViaPointClick = viaPointIndex => {
    const { activeSlackInputs } = this.state;
    this.setState(
      {
        activeSlackInputs: this.updateViaPointSlack(
          activeSlackInputs,
          viaPointIndex,
        ),
      },
      () =>
        this.props.viaPointNames.length > 1
          ? this.props.removeViapoints(viaPointIndex)
          : this.props.toggleViaPoint(false),
    );
  };

  render = () => {
    const slackTime = this.getSlackTimeOptions();

    return (
      <div
        className={cx([
          'autosuggest-panel',
          {
            small: this.props.breakpoint !== 'large',
            isItinerary: this.props.isItinerary,
          },
        ])}
      >
        <div
          className={cx([
            'dark-overlay',
            {
              hidden: !this.state.showDarkOverlay,
              isItinerary: this.props.isItinerary,
            },
          ])}
        />
        <div className="origin-input-container">
          <DTEndpointAutosuggest
            id="origin"
            autoFocus={
              // Disable autofocus if using IE11
              isIe
                ? false
                : this.props.breakpoint === 'large' && !this.props.origin.ready
            }
            refPoint={this.props.origin}
            className={this.class(this.props.origin)}
            searchType={this.props.searchType}
            placeholder={this.props.originPlaceHolder}
            value={this.value(this.props.origin)}
            isFocused={this.isFocused}
            onLocationSelected={location => {
              let origin = { ...location, ready: true };
              let { destination } = this.props;
              if (location.type === 'CurrentLocation') {
                origin = { ...location, gps: true, ready: !!location.lat };
                if (destination.gps === true) {
                  // destination has gps, clear destination
                  destination = { set: false };
                }
              }
              navigateTo({
                base: this.context.location,
                origin,
                destination,
                context: this.props.isItinerary ? PREFIX_ITINERARY_SUMMARY : '',
                router: this.context.router,
                tab: this.props.tab,
              });
            }}
          />
          <ItinerarySearchControl>
            <div
              className="switch"
              onClick={() => this.props.swapOrder()}
              onKeyPress={e =>
                isKeyboardSelectionEvent(e) && this.props.swapOrder()
              }
              role="button"
              tabIndex="0"
            >
              <Icon img="icon-icon_direction-b" />
            </div>
          </ItinerarySearchControl>
        </div>
        {this.props.isViaPoint &&
          this.props.viaPointNames.map((o, i) => (
            <div
              className="viapoint-container"
              key={`viapoint-${i}`} // eslint-disable-line
            >
              <div className={`viapoint-input-container viapoint-${i + 1}`}>
                <div className="viapoint-before">
                  <Icon img="icon-icon_ellipsis" />
                </div>
                <DTEndpointAutosuggest
                  id="viapoint"
                  autoFocus={
                    // Disable autofocus if using IE11
                    isIe ? false : this.context.breakpoint === 'large'
                  }
                  refPoint={this.props.origin}
                  searchType="endpoint"
                  placeholder="via-point"
                  className="viapoint"
                  isFocused={this.isFocused}
                  value={o.split('::')[0]}
                  onLocationSelected={item =>
                    this.checkInputForViapoint(item, i)
                  }
                />
                <ItinerarySearchControl>
                  <div
                    className="addViaPointSlack"
                    role="button"
                    tabIndex={0}
                    onClick={() => this.toggleSlackInput(i)}
                    onKeyPress={e =>
                      isKeyboardSelectionEvent(e) && this.toggleSlackInput(i)
                    }
                  >
                    <Icon img="icon-icon_time" />
                  </div>
                </ItinerarySearchControl>
                <ItinerarySearchControl>
                  <div
                    className="removeViaPoint"
                    role="button"
                    tabIndex={0}
                    onClick={() => this.handleRemoveViaPointClick(i)}
                    onKeyPress={e =>
                      isKeyboardSelectionEvent(e) &&
                      this.handleRemoveViaPointClick(i)
                    }
                  >
                    <span>
                      <Icon img="icon-icon_close" />
                    </span>
                  </div>
                </ItinerarySearchControl>
              </div>
              <div
                className={cx('input-viapoint-slack-container', {
                  collapsed: !this.state.activeSlackInputs.includes(i),
                })}
              >
                <FormattedMessage
                  defaultMessage="viapoint-slack-amount"
                  id="viapoint-slack-amount"
                />
                <div className="select-wrapper">
                  <Select
                    name="viapoint-slack-amount"
                    selected="0"
                    options={slackTime}
                    onSelectChange={e => console.log(e.target.value)}
                  />
                  <Icon
                    className="fake-select-arrow"
                    img="icon-icon_arrow-dropdown"
                  />
                </div>
              </div>
            </div>
          ))}
        {(this.props.destination && this.props.destination.set) ||
        this.props.origin.ready ||
        this.props.isItinerary ? (
          <div className="destination-input-container">
            <DTEndpointAutosuggest
              id="destination"
              autoFocus={
                // Disable autofocus if using IE11
                isIe ? false : this.props.breakpoint === 'large'
              }
              refPoint={this.props.origin}
              searchType={this.props.searchType}
              placeholder="give-destination"
              className={this.class(this.props.destination)}
              isFocused={this.isFocused}
              value={this.value(this.props.destination)}
              onLocationSelected={location => {
                let { origin } = this.props;
                let destination = { ...location, ready: true };
                if (location.type === 'CurrentLocation') {
                  destination = {
                    ...location,
                    gps: true,
                    ready: !!location.lat,
                  };
                  if (origin.gps === true) {
                    origin = { set: false };
                  }
                }
                navigateTo({
                  base: this.context.location,
                  origin,
                  destination,
                  context: this.props.isItinerary
                    ? PREFIX_ITINERARY_SUMMARY
                    : '',
                  router: this.context.router,
                  tab: this.props.tab,
                });
              }}
            />
            <ItinerarySearchControl>
              <div
                className={cx('addViaPoint', 'more', {
                  collapsed: this.props.viaPointNames.length > 4,
                })}
                role="button"
                tabIndex={0}
                onClick={() =>
                  this.props.isViaPoint
                    ? this.props.addMoreViapoints(
                        this.props.viaPointNames.length - 1,
                      )
                    : this.props.toggleViaPoint(true)
                }
                onKeyPress={e =>
                  isKeyboardSelectionEvent(e) &&
                  (this.props.isViaPoint
                    ? this.props.addMoreViapoints(
                        this.props.viaPointNames.length - 1,
                      )
                    : this.props.toggleViaPoint(true))
                }
              >
                <Icon img="icon-icon_plus" />
              </div>
            </ItinerarySearchControl>
          </div>
        ) : null}
      </div>
    );
  };
}

const DTAutosuggestPanelWithBreakpoint = withBreakpoint(DTAutosuggestPanel);
export {
  DTAutosuggestPanel as component,
  DTAutosuggestPanelWithBreakpoint as default,
};
