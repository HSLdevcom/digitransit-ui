import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import { routerShape, locationShape } from 'react-router';

import DTEndpointAutosuggest from './DTEndpointAutosuggest';
import Icon from './Icon';
import Select from './Select';
import { isIe, isKeyboardSelectionEvent } from '../util/browser';
import { navigateTo, PREFIX_ITINERARY_SUMMARY } from '../util/path';
import { dtLocationShape } from '../util/shapes';
import withBreakpoint from '../util/withBreakpoint';

export const getEmptyViaPointPlaceHolder = () => ({});

const isViaPointEmpty = viaPoint => {
  if (viaPoint === undefined) {
    return true;
  }
  const keys = Object.keys(viaPoint);
  return (
    keys.length === 0 || (keys.length === 1 && keys[0] === 'locationSlack')
  );
};

const ItinerarySearchControl = ({
  children,
  className,
  enabled,
  onClick,
  onKeyPress,
  ...rest
}) =>
  enabled &&
  onClick && (
    <div className="itinerary-search-control">
      <div
        {...rest}
        className={cx(className, 'cursor-pointer')}
        onClick={onClick}
        onKeyPress={onKeyPress}
        role="button"
        tabIndex="0"
      >
        {children}
      </div>
    </div>
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
    originPlaceHolder: PropTypes.string,
    searchType: PropTypes.string,
    initialViaPoints: PropTypes.arrayOf(dtLocationShape),
    tab: PropTypes.string,
    updateViaPoints: PropTypes.func,
    breakpoint: PropTypes.string.isRequired,
    swapOrder: PropTypes.func,
  };

  static defaultProps = {
    initialViaPoints: [],
    isItinerary: false,
    originPlaceHolder: 'give-origin',
    searchType: 'endpoint',
    swapOrder: undefined,
    updateViaPoints: () => {},
  };

  constructor(props) {
    super(props);
    this.draggableViaPoints = [];
    this.state = {
      activeSlackInputs: [],
      showDarkOverlay: false,
      viaPoints: this.props.initialViaPoints.map(vp => ({ ...vp })),
    };
  }

  getSlackTimeOptions = () => {
    const timeOptions = [];
    for (let i = 0; i <= 9; i++) {
      const valueInMinutes = i * 10;
      timeOptions.push({
        displayName: `${i}`,
        displayNameObject: `${valueInMinutes} ${this.context.intl.formatMessage(
          {
            id: 'minute-short',
          },
        )}`,
        value: valueInMinutes * 60,
      });
    }
    return timeOptions;
  };

  setDraggableViaPointRef = (element, index) => {
    this.draggableViaPoints[index] = element;
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

  updateViaPoints = viaPoints => {
    if (viaPoints.length === 0) {
      this.props.updateViaPoints([]);
      return;
    }
    this.props.updateViaPoints(viaPoints.filter(vp => !isViaPointEmpty(vp)));
  };

  updateViaPointSlack = (
    activeViaPointSlacks,
    updatedViaPointIndex,
    viaPointRemoved = false,
  ) => {
    const foundAtIndex = activeViaPointSlacks.indexOf(updatedViaPointIndex);
    if (foundAtIndex > -1) {
      activeViaPointSlacks.splice(foundAtIndex, 1);
    }
    return viaPointRemoved
      ? activeViaPointSlacks.map(
          value => (value > updatedViaPointIndex ? value - 1 : value),
        )
      : activeViaPointSlacks;
  };

  handleToggleViaPointSlackClick = viaPointIndex => {
    const { activeSlackInputs } = this.state;
    this.setState({
      activeSlackInputs: activeSlackInputs.includes(viaPointIndex)
        ? this.updateViaPointSlack(activeSlackInputs, viaPointIndex)
        : activeSlackInputs.concat([viaPointIndex]),
    });
  };

  handleViaPointSlackTimeSelected = (slackTimeInSeconds, i) => {
    const { viaPoints } = this.state;
    viaPoints[i].locationSlack = Number.parseInt(slackTimeInSeconds, 10);
    this.setState({ viaPoints }, () => this.updateViaPoints(viaPoints));
  };

  handleViaPointLocationSelected = (viaPointLocation, i) => {
    const { viaPoints } = this.state;
    viaPoints[i] = {
      ...viaPointLocation,
    };
    this.setState({ viaPoints }, () => this.updateViaPoints(viaPoints));
  };

  handleRemoveViaPointClick = viaPointIndex => {
    const { activeSlackInputs, viaPoints } = this.state;
    viaPoints.splice(viaPointIndex, 1);
    this.setState(
      {
        activeSlackInputs: this.updateViaPointSlack(
          activeSlackInputs,
          viaPointIndex,
          true,
        ),
        viaPoints,
      },
      () => this.updateViaPoints(viaPoints),
    );
  };

  handleAddViaPointClick = () => {
    const { viaPoints } = this.state;
    viaPoints.push(getEmptyViaPointPlaceHolder());
    this.setState({ viaPoints });
  };

  handleSwapOrderClick = () => {
    const { viaPoints } = this.state;
    viaPoints.reverse();
    this.setState({ viaPoints }, () => this.props.swapOrder());
  };

  handleOnViaPointDragOver = (event, index) => {
    event.preventDefault();
    this.setState({ isDraggingOverIndex: index });
  };

  handleOnViaPointDragEnd = () => {
    this.setState({
      isDraggingOverIndex: undefined,
    });
  };

  handleOnViaPointDrop = (event, targetIndex) => {
    event.preventDefault();
    const draggedIndex = Number.parseInt(
      event.dataTransfer.getData('text'),
      10,
    );
    if (
      Number.isNaN(draggedIndex) ||
      draggedIndex === targetIndex ||
      targetIndex - draggedIndex === 1
    ) {
      return;
    }

    const { viaPoints } = this.state;
    const draggedViaPoint = viaPoints.splice(draggedIndex, 1)[0];
    viaPoints.splice(
      targetIndex > draggedIndex ? targetIndex - 1 : targetIndex,
      0,
      draggedViaPoint,
    );
    this.setState({ viaPoints, isDraggingOverIndex: undefined }, () =>
      this.updateViaPoints(viaPoints),
    );
  };

  handleStartViaPointDragging = (event, isDraggingIndex) => {
    // IE and Edge < 18 do not support setDragImage
    if (
      event.dataTransfer.setDragImage &&
      this.draggableViaPoints[isDraggingIndex]
    ) {
      event.dataTransfer.setDragImage(
        this.draggableViaPoints[isDraggingIndex],
        0,
        0,
      );
    }

    // IE throws an error if trying to set the dropEffect
    if (!isIe) {
      event.dataTransfer.dropEffect = 'move'; // eslint-disable-line no-param-reassign
    }
    event.dataTransfer.effectAllowed = 'move'; // eslint-disable-line no-param-reassign

    // IE and Edge only support the type 'text'
    event.dataTransfer.setData('text', `${isDraggingIndex}`);
  };

  render = () => {
    const { breakpoint, isItinerary, origin } = this.props;
    const { activeSlackInputs, isDraggingOverIndex, viaPoints } = this.state;
    const slackTime = this.getSlackTimeOptions();

    const defaultSlackTimeValue = 0;
    const getViaPointSlackTimeOrDefault = (
      viaPoint,
      defaultValue = defaultSlackTimeValue,
    ) => (viaPoint && viaPoint.locationSlack) || defaultValue;
    const isViaPointSlackTimeInputActive = index =>
      activeSlackInputs.includes(index);

    return (
      <div
        className={cx([
          'autosuggest-panel',
          {
            small: breakpoint !== 'large',
            isItinerary,
          },
        ])}
      >
        <div
          className={cx([
            'dark-overlay',
            {
              hidden: !this.state.showDarkOverlay,
              isItinerary,
            },
          ])}
        />
        <div className="origin-input-container">
          <DTEndpointAutosuggest
            icon="mapMarker-from"
            id="origin"
            autoFocus={
              // Disable autofocus if using IE11
              isIe ? false : breakpoint === 'large' && !origin.ready
            }
            refPoint={origin}
            className={this.class(origin)}
            searchType={this.props.searchType}
            placeholder={this.props.originPlaceHolder}
            value={this.value(origin)}
            isFocused={this.isFocused}
            onLocationSelected={location => {
              let newOrigin = { ...location, ready: true };
              let { destination } = this.props;
              if (location.type === 'CurrentLocation') {
                newOrigin = { ...location, gps: true, ready: !!location.lat };
                if (destination.gps === true) {
                  // destination has gps, clear destination
                  destination = { set: false };
                }
              }
              navigateTo({
                base: this.context.location,
                origin: newOrigin,
                destination,
                context: this.props.isItinerary ? PREFIX_ITINERARY_SUMMARY : '',
                router: this.context.router,
                tab: this.props.tab,
              });
            }}
          />
          <ItinerarySearchControl
            className="switch"
            enabled={isItinerary}
            onClick={() => this.handleSwapOrderClick()}
            onKeyPress={e =>
              isKeyboardSelectionEvent(e) && this.handleSwapOrderClick()
            }
          >
            <Icon img="icon-icon_direction-b" />
          </ItinerarySearchControl>
        </div>
        <div className="viapoints-container">
          {viaPoints.map((o, i) => (
            <div
              className={cx('viapoint-container', {
                'drop-target-before': i === isDraggingOverIndex,
              })}
              key={`viapoint-${i}`} // eslint-disable-line
              onDragOver={e => this.handleOnViaPointDragOver(e, i)}
              onDrop={e => this.handleOnViaPointDrop(e, i)}
              ref={el => this.setDraggableViaPointRef(el, i)}
            >
              <div className={`viapoint-input-container viapoint-${i + 1}`}>
                <div
                  className="viapoint-before"
                  draggable
                  onDragEnd={this.handleOnViaPointDragEnd}
                  onDragStart={e => this.handleStartViaPointDragging(e, i)}
                  style={{ cursor: 'move' }}
                >
                  <Icon img="icon-icon_ellipsis" />
                </div>
                <DTEndpointAutosuggest
                  icon="mapMarker-via"
                  id="viapoint"
                  autoFocus={
                    // Disable autofocus if using IE11
                    isIe ? false : breakpoint === 'large'
                  }
                  refPoint={this.props.origin}
                  searchType="endpoint"
                  placeholder="via-point"
                  className="viapoint"
                  isFocused={this.isFocused}
                  value={(o && o.address) || ''}
                  onLocationSelected={item =>
                    this.handleViaPointLocationSelected(item, i)
                  }
                />
                <ItinerarySearchControl
                  className="addViaPointSlack"
                  enabled={isItinerary}
                  onClick={() => this.handleToggleViaPointSlackClick(i)}
                  onKeyPress={e =>
                    isKeyboardSelectionEvent(e) &&
                    this.handleToggleViaPointSlackClick(i)
                  }
                >
                  <Icon img="icon-icon_time" />
                  <Icon
                    img="icon-icon_attention"
                    className={cx('super-icon', {
                      collapsed:
                        isViaPointSlackTimeInputActive(i) ||
                        getViaPointSlackTimeOrDefault(viaPoints[i]) ===
                          defaultSlackTimeValue,
                    })}
                  />
                </ItinerarySearchControl>
                <ItinerarySearchControl
                  className="removeViaPoint"
                  enabled={isItinerary}
                  onClick={() => this.handleRemoveViaPointClick(i)}
                  onKeyPress={e =>
                    isKeyboardSelectionEvent(e) &&
                    this.handleRemoveViaPointClick(i)
                  }
                >
                  <Icon img="icon-icon_close" />
                </ItinerarySearchControl>
              </div>
              <div
                className={cx('input-viapoint-slack-container', {
                  collapsed: !isViaPointSlackTimeInputActive(i),
                })}
              >
                <FormattedMessage
                  defaultMessage="viapoint-slack-amount"
                  id="viapoint-slack-amount"
                />
                <div className="select-wrapper">
                  <Select
                    name="viapoint-slack-amount"
                    selected={`${getViaPointSlackTimeOrDefault(viaPoints[i])}`}
                    options={slackTime}
                    onSelectChange={e =>
                      this.handleViaPointSlackTimeSelected(e.target.value, i)
                    }
                  />
                  <Icon
                    className="fake-select-arrow"
                    img="icon-icon_arrow-dropdown"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {((this.props.destination && this.props.destination.set) ||
          origin.ready ||
          isItinerary) && (
          <div className="destination-input-container">
            <DTEndpointAutosuggest
              icon="mapMarker-to"
              id="destination"
              autoFocus={
                // Disable autofocus if using IE11
                isIe ? false : breakpoint === 'large'
              }
              refPoint={origin}
              searchType={this.props.searchType}
              placeholder="give-destination"
              className={this.class(this.props.destination)}
              isFocused={this.isFocused}
              value={this.value(this.props.destination)}
              onLocationSelected={location => {
                let updatedOrigin = origin;
                let destination = { ...location, ready: true };
                if (location.type === 'CurrentLocation') {
                  destination = {
                    ...location,
                    gps: true,
                    ready: !!location.lat,
                  };
                  if (origin.gps === true) {
                    updatedOrigin = { set: false };
                  }
                }
                navigateTo({
                  base: this.context.location,
                  origin: updatedOrigin,
                  destination,
                  context: isItinerary ? PREFIX_ITINERARY_SUMMARY : '',
                  router: this.context.router,
                  tab: this.props.tab,
                });
              }}
            />
            <ItinerarySearchControl
              className={cx('addViaPoint', 'more', {
                collapsed: viaPoints.length > 4,
              })}
              enabled={isItinerary}
              onClick={() => this.handleAddViaPointClick()}
              onKeyPress={e =>
                isKeyboardSelectionEvent(e) && this.handleAddViaPointClick()
              }
            >
              <Icon img="icon-icon_plus" />
            </ItinerarySearchControl>
          </div>
        )}
      </div>
    );
  };
}

const DTAutosuggestPanelWithBreakpoint = withBreakpoint(DTAutosuggestPanel);
export {
  DTAutosuggestPanel as component,
  DTAutosuggestPanelWithBreakpoint as default,
};
