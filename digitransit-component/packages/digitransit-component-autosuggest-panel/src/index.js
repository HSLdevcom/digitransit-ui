/* eslint-disable import/no-extraneous-dependencies */
import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { ReactSortable } from 'react-sortablejs';
import i18next from 'i18next';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import Icon from '@digitransit-component/digitransit-component-icon';
import Select from './helpers/Select';
import translations from './helpers/translations';
import styles from './helpers/styles.scss';

i18next.init({ lng: 'fi', resources: {} });

i18next.addResourceBundle('en', 'translation', translations.en);
i18next.addResourceBundle('fi', 'translation', translations.fi);
i18next.addResourceBundle('sv', 'translation', translations.sv);

export const getEmptyViaPointPlaceHolder = () => ({});

const isViaPointEmpty = viaPoint => {
  if (viaPoint === undefined) {
    return true;
  }
  const keys = Object.keys(viaPoint);
  return (
    keys.length === 1 || (keys.length === 2 && keys.includes('locationSlack'))
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
    <div className={styles['itinerary-search-control']}>
      <div
        {...rest}
        className={className}
        onClick={onClick}
        onKeyPress={onKeyPress}
        role="button"
        tabIndex="0"
      >
        {children}
      </div>
    </div>
  );

ItinerarySearchControl.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired,
};

/**
 * Panel that renders two DTAutosuggest search fields, including viapoint handling
 *
 * @example
 * const searchContext = {
 *   isPeliasLocationAware: false // true / false does Let Pelias suggest based on current user location
 *   minimalRegexp: undefined // used for testing min. regexp. For example: new RegExp('.{2,}'),
 *   lineRegexp: undefined //  identify searches for route numbers/labels: bus | train | metro. For example: new RegExp(
 *    //   '(^[0-9]+[a-z]?$|^[yuleapinkrtdz]$|(^m[12]?b?$))',
 *    //  'i',
 *    //  ),
 *   URL_PELIAS: '' // url for pelias searches
 *   feedIDs: ['HSL', 'HSLLautta'] // FeedId's like  [HSL, HSLLautta]
 *   geocodingSources: ['oa','osm','nlsfi']  // sources for geocoding
 *   geocodingSearchParams; {}  // Searchparmas fro geocoding
 *   getFavouriteLocations: () => ({}),    // Function that returns array of favourite locations.
 *   getFavouriteStops: () => ({}),        // Function that returns array of favourite stops.
 *   getLanguage: () => ({}),              // Function that returns current language.
 *   getStoredFavouriteRoutes: () => ({}), // Function that returns array of favourite routes.
 *   getPositions: () => ({}),             // Function that returns user's geolocation.
 *   getRoutes: () => ({}),                // Function that fetches routes from graphql API.
 *   getStopAndStationsQuery: () => ({}),       // Function that fetches favourite stops and stations from graphql API.
 *   getFavouriteRoutes: () => ({}),       // Function that fetches favourite routes from graphql API.
 *   startLocationWatch: () => ({}),       // Function that locates users geolocation.
 *   saveSearch: () => ({}),               // Function that saves search to old searches store.
 * };
 *
 * const origin = {
 *  lat: 60.169196,
 *  lon: 24.957674,
 *  address: 'Aleksanterinkatu, Helsinki',
 *  set: true,
 *  ready: true,
 * }
 *
 * const destination = {
 *   lat: 60.199093,
 *   lon: 24.940536,
 *   address: 'Opastinsilta 6, Helsinki',
 *   set: true,
 *   ready: true,
 * }
 * onSelect() {
 *  return null;  // Define what to do when a suggestion is being selected. None by default.
 *  }
 * const targets = ['Locations', 'Stops', 'Routes']; // Defines what you are searching. all available options are Locations, Stops, Routes, MapPosition and CurrentPosition. Leave empty to search all targets.
 * const sources = ['Favourite', 'History', 'Datasource'] // Defines where you are searching. all available are: Favourite, History (previously searched searches), and Datasource. Leave empty to use all sources.
 * <DTAutosuggestPanel
 *    origin={origin} // Selected origin point
 *    destination={destination} // Selected destination point
 *    originPlaceHolder={'Give origin'} // Optional Give string shown initially inside origin search field
 *    destinationPlaceHolder={'Give destination'} // Optional Give string shown initally inside destination search field
 *    breakpoint={'large'} // Required. available options are 'small' or 'large'. Large shows panel styles etc. meant for desktop and small shows panel styles etc meant for mobile.
 *    showMultiPointControls={false} // Optional. If true, controls for via points and reversing is being shown.
 *    initialViaPoints={[]} // Optional.  If showMultiPointControls is set to true, pass initial via points to the panel. Currently no default implementation is given.
 *    updateViaPoints={() => return []} // Optional. If showMultiPointControls is set to true, define how to update your via point list with this function. Currenlty no default implementation is given.
 *    swapOrder={() => return null} // Optional. If showMultiPointControls is set to true, define how to swap order of your points (origin, destination, viapoints). Currently no default implementation is given.
 *    searchContext={searchContext}
 *    onSelect={this.onSelect}
 *    lang="fi" // Define language fi sv or en.
 *    addAnalyticsEvent={null} // Optional. you can record an analytics event if you wish. if passed, component will pass an category, action, name parameters to addAnalyticsEvent
 *    disableAutoFocus={false} // Optional. use this to disable autofocus completely from DTAutosuggestPanel
 *    sources={sources}
 *    targets={targets}
 *    isMobile  // Optional. Defaults to false. Whether to use mobile search.
 */
class DTAutosuggestPanel extends React.Component {
  static propTypes = {
    origin: PropTypes.object.isRequired,
    destination: PropTypes.object.isRequired,
    showMultiPointControls: PropTypes.bool,
    originPlaceHolder: PropTypes.string,
    destinationPlaceHolder: PropTypes.string,
    initialViaPoints: PropTypes.arrayOf(PropTypes.object),
    updateViaPoints: PropTypes.func,
    breakpoint: PropTypes.string.isRequired,
    swapOrder: PropTypes.func,
    searchPanelText: PropTypes.string,
    searchContext: PropTypes.any.isRequired,
    onSelect: PropTypes.func,
    addAnalyticsEvent: PropTypes.func,
    lang: PropTypes.string,
    disableAutoFocus: PropTypes.bool,
    sources: PropTypes.arrayOf(PropTypes.string),
    targets: PropTypes.arrayOf(PropTypes.string),
    isMobile: PropTypes.bool,
  };

  static defaultProps = {
    initialViaPoints: [],
    showMultiPointControls: false,
    originPlaceHolder: 'give-origin',
    destinationPlaceHolder: 'give-destination',
    swapOrder: undefined,
    updateViaPoints: () => {},
    lang: 'fi',
    sources: [],
    targets: [],
    disableAutoFocus: false,
    isMobile: false,
  };

  constructor(props) {
    super(props);
    this.draggableViaPoints = [];
    this.state = {
      activeSlackInputs: [],
      viaPoints: this.props.initialViaPoints.map(vp => ({ ...vp })),
      refs: [],
    };
  }

  componentDidMount = () => {
    i18next.changeLanguage(this.props.lang);
  };

  componentDidUpdate = prevProps => {
    if (prevProps.lang !== this.props.lang) {
      i18next.changeLanguage(this.props.lang);
    }
  };

  getSlackTimeOptions = () => {
    const timeOptions = [];
    for (let i = 0; i <= 9; i++) {
      const valueInMinutes = i * 10;
      timeOptions.push({
        displayName: `${valueInMinutes} ${i18next.t('minute-short')}`,
        value: valueInMinutes * 60,
      });
    }
    return timeOptions;
  };

  setDraggableViaPointRef = (element, index) => {
    this.draggableViaPoints[index] = element;
  };

  storeReference = ref => {
    this.setState(prevState => ({ refs: [...prevState.refs, ref] }));
  };

  handleFocusChange = () => {
    const { destination } = this.props;
    if (!destination || !destination.set) {
      this.state.refs[1].focus();
    }
  };

  isKeyboardSelectionEvent = event => {
    const space = [13, ' ', 'Spacebar'];
    const enter = [32, 'Enter'];
    const key = (event && (event.key || event.which || event.keyCode)) || '';
    if (!key || !space.concat(enter).includes(key)) {
      return false;
    }
    event.preventDefault();
    return true;
  };

  value = location =>
    (location && location.address) ||
    (location && location.gps && location.ready && 'Nykyinen sijainti') ||
    '';

  class = location =>
    location && location.gps === true ? 'position' : 'location';

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
    if (this.props.addAnalyticsEvent) {
      this.props.addAnalyticsEvent({
        action: 'EditViaPointStopDuration',
        category: 'ItinerarySettings',
        name: slackTimeInSeconds / 60,
      });
    }
    const { viaPoints } = this.state;
    viaPoints[i].locationSlack = Number.parseInt(slackTimeInSeconds, 10);
    this.setState({ viaPoints }, () => this.updateViaPoints(viaPoints));
  };

  handleViaPointLocationSelected = (viaPointLocation, i) => {
    if (this.props.addAnalyticsEvent) {
      this.props.addAnalyticsEvent({
        action: 'EditJourneyViaPoint',
        category: 'ItinerarySettings',
        name: viaPointLocation.type,
      });
    }
    const { viaPoints } = this.state;
    viaPoints[i] = {
      ...viaPointLocation,
    };
    this.setState({ viaPoints }, () => this.updateViaPoints(viaPoints));
  };

  handleRemoveViaPointClick = viaPointIndex => {
    if (this.props.addAnalyticsEvent) {
      this.props.addAnalyticsEvent({
        action: 'RemoveJourneyViaPoint',
        category: 'ItinerarySettings',
        name: null,
      });
    }
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
    if (this.props.addAnalyticsEvent) {
      this.props.addAnalyticsEvent({
        action: 'AddJourneyViaPoint',
        category: 'ItinerarySettings',
        name: 'Qu}ickSettingsButton',
      });
    }
    const { viaPoints } = this.state;
    viaPoints.push(getEmptyViaPointPlaceHolder());
    this.setState({ viaPoints });
  };

  handleSwapOrderClick = () => {
    if (this.props.addAnalyticsEvent) {
      this.props.addAnalyticsEvent({
        action: 'SwitchJourneyStartAndEndPointOrder',
        category: 'ItinerarySettings',
        name: null,
      });
    }
    const { viaPoints } = this.state;
    viaPoints.reverse();
    this.setState({ viaPoints }, () => this.props.swapOrder());
  };

  getSlackDisplay = slackInSeconds => {
    return `${slackInSeconds / 60} ${i18next.t('minute-short')}`;
  };

  render = () => {
    const {
      breakpoint,
      showMultiPointControls,
      origin,
      searchPanelText,
      searchContext,
      disableAutoFocus,
    } = this.props;
    const { activeSlackInputs, viaPoints } = this.state;
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
          styles['autosuggest-panel'],
          {
            small: breakpoint !== 'large',
            showMultiPointControls,
          },
        ])}
      >
        {' '}
        {searchPanelText ? (
          <div>
            <h2 className={styles['autosuggest-searchpanel-text']}>
              {' '}
              {searchPanelText}
            </h2>
          </div>
        ) : null}
        <div className={styles['origin-input-container']}>
          <DTAutoSuggest
            icon="mapMarker"
            id="origin"
            autoFocus={
              disableAutoFocus === true
                ? false
                : breakpoint === 'large' && !origin.ready
            }
            storeRef={this.storeReference}
            className={this.class(origin)}
            placeholder={this.props.originPlaceHolder}
            value={this.value(origin)}
            searchContext={searchContext}
            onSelect={this.props.onSelect}
            focusChange={this.handleFocusChange}
            lang={this.props.lang}
            sources={this.props.sources}
            targets={this.props.targets}
            isMobile={this.props.isMobile}
          />
          <ItinerarySearchControl
            className={styles.opposite}
            enabled={showMultiPointControls}
            onClick={() => this.handleSwapOrderClick()}
            onKeyPress={e =>
              this.isKeyboardSelectionEvent(e) && this.handleSwapOrderClick()
            }
            aria-label={i18next.t('swap-order-button-label')}
          >
            <Icon img="opposite" />
          </ItinerarySearchControl>
        </div>
        {viaPoints.length === 0 && (
          <div className={styles['rectangle-container']}>
            <div className={styles.rectangle} />
          </div>
        )}
        <ReactSortable
          className={styles['viapoints-container']}
          list={viaPoints}
          handle={`.${styles['viapoint-before']}`}
          animation={200}
          setList={items =>
            this.setState({ viaPoints: items }, () => {
              const newViaPoints = items.filter(vp => !isViaPointEmpty(vp));
              if (newViaPoints.length > 0) {
                this.props.updateViaPoints(newViaPoints);
              }
            })
          }
        >
          {viaPoints.map((o, i) => (
            <div
              className={cx(styles['viapoint-container'])}
              key={`viapoint-${i}`} // eslint-disable-line
            >
              <div className={styles['light-gray-background']}>
                <div className={styles.row}>
                  <div
                    className={styles['viapoint-before']}
                    style={{ cursor: 'move' }}
                  >
                    <Icon img="ellipsis" rotate={90} />
                  </div>
                  <div
                    className={cx(
                      `${styles['viapoint-input-container']} ${
                        styles[`viapoint-${i + 1}`]
                      }`,
                    )}
                  >
                    <DTAutoSuggest
                      icon="mapMarker-via"
                      id="via-point"
                      ariaLabel={i18next.t('via-point-index', { index: i + 1 })}
                      autoFocus={
                        disableAutoFocus === true
                          ? false
                          : breakpoint === 'large'
                      }
                      placeholder="via-point"
                      className="viapoint"
                      searchContext={searchContext}
                      value={(o && o.address) || ''}
                      onSelect={this.props.onSelect}
                      handleViaPoints={item =>
                        this.handleViaPointLocationSelected(item, i)
                      }
                      lang={this.props.lang}
                      sources={this.props.sources}
                      targets={this.props.targets}
                      isMobile={this.props.isMobile}
                    />
                  </div>
                  <ItinerarySearchControl
                    className={styles['add-via-point-slack']}
                    enabled={showMultiPointControls}
                    onClick={() => this.handleToggleViaPointSlackClick(i)}
                    onKeyPress={e =>
                      this.isKeyboardSelectionEvent(e) &&
                      this.handleToggleViaPointSlackClick(i)
                    }
                    aria-label={i18next.t(
                      isViaPointSlackTimeInputActive(i)
                        ? 'add-via-duration-button-label-open'
                        : 'add-via-duration-button-label-close',
                      { index: i + 1 },
                    )}
                  >
                    <Icon img="time" />
                  </ItinerarySearchControl>
                </div>
                {!isViaPointSlackTimeInputActive(i) &&
                  viaPoints[i] &&
                  viaPoints[i].locationSlack > 0 && (
                    <span
                      className={styles['viapoint-slack-time']}
                    >{`${i18next.t(
                      'viapoint-slack-amount',
                    )}: ${this.getSlackDisplay(
                      viaPoints[i].locationSlack,
                    )}`}</span>
                  )}
                <div
                  className={cx(styles['input-viapoint-slack-container'], {
                    collapsed: !isViaPointSlackTimeInputActive(i),
                  })}
                >
                  <div className={styles['select-wrapper']}>
                    <Select
                      id={`viapoint-slack-${i}`}
                      label={i18next.t('viapoint-slack-amount')}
                      options={slackTime}
                      value={getViaPointSlackTimeOrDefault(viaPoints[i])}
                      getDisplay={this.getSlackDisplay}
                      viaPointIndex={i}
                      icon={
                        <span
                          className={`${styles['combobox-icon']} ${
                            styles['time-input-icon']
                          }`}
                        >
                          <Icon img="time" />
                        </span>
                      }
                      onSlackTimeSelected={this.handleViaPointSlackTimeSelected}
                    />
                  </div>
                </div>
              </div>
              <ItinerarySearchControl
                className={styles['remove-via-point']}
                enabled={showMultiPointControls}
                onClick={() => this.handleRemoveViaPointClick(i)}
                onKeyPress={e =>
                  this.isKeyboardSelectionEvent(e) &&
                  this.handleRemoveViaPointClick(i)
                }
                aria-label={i18next.t('remove-via-button-label', {
                  index: i + 1,
                })}
              >
                <Icon img="close" />
              </ItinerarySearchControl>
            </div>
          ))}
        </ReactSortable>
        <div className={styles['destination-input-container']}>
          <DTAutoSuggest
            icon="mapMarker"
            id="destination"
            autoFocus={
              disableAutoFocus === true
                ? false
                : breakpoint === 'large' && origin.ready
            }
            storeRef={this.storeReference}
            placeholder={this.props.destinationPlaceHolder}
            className={this.class(this.props.destination)}
            searchContext={searchContext}
            onSelect={this.props.onSelect}
            value={this.value(this.props.destination)}
            lang={this.props.lang}
            sources={this.props.sources}
            targets={this.props.targets}
            isMobile={this.props.isMobile}
          />
          <ItinerarySearchControl
            className={cx(styles['add-via-point'], styles.more, {
              collapsed: viaPoints.length > 4,
            })}
            enabled={showMultiPointControls}
            onClick={() => this.handleAddViaPointClick()}
            onKeyPress={e =>
              this.isKeyboardSelectionEvent(e) && this.handleAddViaPointClick()
            }
            aria-label={i18next.t('add-via-button-label')}
          >
            <Icon img="viapoint" width={1.25} height={1.375} />
          </ItinerarySearchControl>
        </div>
      </div>
    );
  };
}

export default DTAutosuggestPanel;
