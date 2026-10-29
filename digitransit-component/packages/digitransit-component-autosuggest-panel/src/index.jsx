/* eslint-disable import/no-extraneous-dependencies */
import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DragDropProvider } from '@dnd-kit/react';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import Icon, {
  defaultColors,
} from '@digitransit-component/digitransit-component-icon';
import isEmpty from 'lodash/isEmpty';
import Select from './helpers/Select';
import SortableViaPoint from './helpers/SortableViaPoint';
import i18n from './helpers/i18n';
import styles from './helpers/styles.scss';

export const getEmptyViaPointPlaceHolder = () => ({});

const isViaPointEmpty = viaPoint => {
  if (viaPoint === undefined || isEmpty(viaPoint)) {
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
  wide = false,
  ...rest
}) => (
  <div
    className={styles['itinerary-search-control']}
    style={{ '--width': wide ? '47px' : '40px' }}
  >
    {onClick && enabled && (
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
    )}
  </div>
);

const updateViaPointSlack = (
  activeViaPointSlacks,
  updatedViaPointIndex,
  viaPointRemoved = false,
) => {
  const remaining = activeViaPointSlacks.filter(
    index => index !== updatedViaPointIndex,
  );
  return viaPointRemoved
    ? remaining.map(index => (index > updatedViaPointIndex ? index - 1 : index))
    : remaining;
};

const isKeyboardSelectionEvent = event => {
  const space = [13, ' ', 'Spacebar'];
  const enter = [32, 'Enter'];
  const key = (event && (event.key || event.which || event.keyCode)) || '';
  if (!key || !space.concat(enter).includes(key)) {
    return false;
  }
  event.preventDefault();
  return true;
};

const value = location =>
  (location && location.address) ||
  (location && location.gps && location.ready && 'Nykyinen sijainti') ||
  '';

const getLocationType = location =>
  location && location.gps === true ? 'position' : 'location';

const getSlackTimeOptions = t => {
  const timeOptions = [];
  for (let i = 0; i <= 9; i++) {
    const valueInMinutes = i * 10;
    timeOptions.push({
      displayName: `${valueInMinutes} ${t('minute-short')}`,
      value: valueInMinutes * 60,
    });
  }
  return timeOptions;
};

ItinerarySearchControl.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired,
  wide: PropTypes.bool,
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
 *   getFavouriteRoutes: () => ({}),       // Function that returns array of favourite routes.
 *   getPositions: () => ({}),             // Function that returns user's geolocation.
 *   getRoutesQuery: () => ({}),           // Function that returns query for fetching routes.
 *   getStopAndStationsQuery: () => ({}),  // Function that fetches favourite stops and stations from graphql API.
 *   getFavouriteRoutesQuery: () => ({}),  // Function that returns query for fetching favourite routes.
 *   getFavouriteVehicleRentalStations: () => ({}),  // Function that returns favourite bike rental station.
 *   getFavouriteVehicleRentalStationsQuery: () => ({}), // Function that returns query for fetching favourite bike rental stations.
 *   getHasOtpLocationFavourites: () => ({}), // Optional. Function that returns whether any OTP-backed favourite is currently available.
 *   startLocationWatch: () => ({}),       // Function that locates users geolocation.
 *   saveSearch: () => ({}),               // Function that saves search to old searches store.
 *   clearOldSearches: () => ({}),         // Function that clears old searches store.
 *   getFutureRoutes: () => ({}),          // Function that return future routes
 *   saveFutureRoute: () => ({}),          // Function that saves a future route
 *   clearFutureRoutes: () => ({}),        // Function that clears future routes
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
 * onSelect(item, id) {
 *  return null;  // Define what to do when a suggestion is being selected. None by default.
 *  }
 * onClear(id) {
 *  return null;  // Define what to do when a suggestion is being selected. None by default.
 * }
 * const getAutoSuggestIcons: {
 *   // Called for every city bike station rendered as a search suggestion. Should return the icon and
 *   // color used for that station. Two icons are available, 'citybike-stop-digitransit' anditybike-stop-digitransit-secondary'.
 *   citybikes: station => {
 *      return ['citybike-stop-digitransit', '#f2b62d'];
 *   }
 * }
 * const targets = ['Locations', 'Stops', 'Routes']; // Defines what you are searching. all available options are Locations, Stops, Routes, VehicleRentalStations, FutureRoutes, MapPosition and CurrentPosition. Leave empty to search all targets.
 * const sources = ['Favourite', 'History', 'Datasource'] // Defines where you are searching. all available are: Favourite, History (previously searched searches), and Datasource. Leave empty to use all sources.
 * <DTAutosuggestPanel
 *    appElement={appElement} // Required. Root element's id. Needed for react-modal component.
 *    origin={origin} // Selected origin point
 *    destination={destination} // Selected destination point
 *    originPlaceHolder={'Give origin'} // Optional Give string shown initially inside origin search field
 *    destinationPlaceHolder={'Give destination'} // Optional Give string shown initally inside destination search field
 *    initialViaPoints={[]} // Optional.  If showViapointControl is set to true, pass initial via points to the panel. Currently no default implementation is given.
 *    updateViaPoints={() => return []} // Optional. If showViapointControl is set to true, define how to update your via point list with this function. Currenlty no default implementation is given.
 *    swapOrder={() => return null} // Optional. If showSwapControl is set to true, define how to swap order of your points (origin, destination, viapoints). Currently no default implementation is given.
 *    searchContext={searchContext}
 *    getAutoSuggestIcons={getAutoSuggestIcons}
 *    onSelect={this.onSelect}
 *    onClear={this.onClear}
 *    lang="fi" // Define language fi sv or en.
 *    addAnalyticsEvent={null} // Optional. you can record an analytics event if you wish. if passed, component will pass an category, action, name parameters to addAnalyticsEvent
 *    disableAutoFocus={false} // Optional. use this to disable autofocus completely from DTAutosuggestPanel
 *    sources={sources}
 *    targets={targets}
 *    isMobile  // Optional. Defaults to false. Whether to use mobile search.
 *    originMobileLabel="Origin label" // Optional. Custom label text for origin field on mobile.
 *    destinationMobileLabel="Destination label" // Optional. Custom label text for destination field on mobile.
 *    handleFocusChange={() => {}} // Optional. If defined overrides default onFocusChange behaviour
 *    showSwapControl={false} // Optional.
 *    showViapointControl={false} // Optional.
 */

const locationShape = PropTypes.shape({
  address: PropTypes.string,
  lat: PropTypes.number,
  lon: PropTypes.number,
  locationSlack: PropTypes.number,
});

const EMPTY_LIST = [];
const noop = () => {};

export default function DTAutosuggestPanel({
  appElement,
  origin,
  destination,
  originPlaceHolder = 'give-origin',
  destinationPlaceHolder = 'give-destination',
  viaPoints: viaPointsProp = null,
  updateViaPoints = noop,
  handleViaPointLocationSelected,
  swapOrder,
  searchPanelText,
  searchContext,
  onSelect,
  onClear,
  addAnalyticsEvent,
  lang,
  disableAutoFocus = false,
  sources = EMPTY_LIST,
  targets = EMPTY_LIST,
  filterResults,
  isMobile = false,
  originMobileLabel = null,
  destinationMobileLabel = null,
  refPoint,
  modeSet,
  colors = defaultColors,
  getAutoSuggestIcons,
  showScroll = false,
  onFocusChange,
  isEmbedded = false,
  showSwapControl = false,
  showViapointControl = false,
  showSlackControl = false,
}) {
  const [t] = useTranslation('translation', { i18n });
  const [activeSlackInputs, setActiveSlackInputs] = useState([]);
  const [, forceUpdate] = useReducer(count => count + 1, 0);
  const destinationInputRef = useRef(null);
  // viaPoints is edited in place and the parent is notified afterwards, so a
  // missing prop needs an instance-local array instead of a shared default
  const fallbackViaPoints = useRef([]);
  const viaPoints = viaPointsProp || fallbackViaPoints.current;
  const { primary } = colors;
  const lng = lang;

  const storeDestinationRef = ref => {
    destinationInputRef.current = ref;
  };

  const handleFocusChange = () => {
    if (!destination || !destination.lat) {
      destinationInputRef.current.focus();
    }
  };

  const updateViaPointList = points => {
    if (points.length === 0) {
      updateViaPoints([]);
      return;
    }
    updateViaPoints(points.filter(vp => !isViaPointEmpty(vp)));
  };

  const handleToggleViaPointSlackClick = viaPointIndex => {
    setActiveSlackInputs(
      activeSlackInputs.includes(viaPointIndex)
        ? updateViaPointSlack(activeSlackInputs, viaPointIndex)
        : activeSlackInputs.concat([viaPointIndex]),
    );
  };

  const handleViaPointSlackTimeSelected = (slackTimeInSeconds, i) => {
    if (addAnalyticsEvent) {
      addAnalyticsEvent({
        action: 'EditViaPointStopDuration',
        category: 'ItinerarySettings',
        name: slackTimeInSeconds / 60,
      });
    }
    viaPoints[i].locationSlack = Number.parseInt(slackTimeInSeconds, 10);
    updateViaPointList(viaPoints);
  };

  const handleRemoveViaPointClick = viaPointIndex => {
    if (addAnalyticsEvent) {
      addAnalyticsEvent({
        action: 'RemoveJourneyViaPoint',
        category: 'ItinerarySettings',
        name: null,
      });
    }
    viaPoints.splice(viaPointIndex, 1);
    setActiveSlackInputs(
      updateViaPointSlack(activeSlackInputs, viaPointIndex, true),
    );
    updateViaPointList(viaPoints);
  };

  const handleAddViaPointClick = () => {
    if (addAnalyticsEvent) {
      addAnalyticsEvent({
        action: 'AddJourneyViaPoint',
        category: 'ItinerarySettings',
        name: 'QuickSettingsButton',
      });
    }
    viaPoints.push(getEmptyViaPointPlaceHolder());
    // re-render so that the placeholder shows up in the panel
    forceUpdate();
  };

  const handleDragEnd = event => {
    if (event.canceled) {
      return;
    }
    const { initialIndex, index } = event.operation.source?.sortable || {};
    if (initialIndex === undefined || initialIndex === index) {
      return;
    }
    const newViaPoints = [...viaPoints];
    const [moved] = newViaPoints.splice(initialIndex, 1);
    newViaPoints.splice(index, 0, moved);
    updateViaPoints(newViaPoints.filter(vp => !isViaPointEmpty(vp)));
  };

  const handleSwapOrderClick = () => {
    if (addAnalyticsEvent) {
      addAnalyticsEvent({
        action: 'SwitchJourneyStartAndEndPointOrder',
        category: 'ItinerarySettings',
        name: null,
      });
    }
    viaPoints.reverse();
    swapOrder();
  };

  const getSlackDisplay = slackInSeconds =>
    `${slackInSeconds / 60} ${t('minute-short', { lng })}`;

  const slackTime = getSlackTimeOptions(t);
  const getViaPointSlackTimeOrDefault = (viaPoint, defaultValue = 0) =>
    (viaPoint && viaPoint.locationSlack) || defaultValue;
  const isViaPointSlackTimeInputActive = index =>
    activeSlackInputs.includes(index);

  return (
    <div
      className={cx([styles['autosuggest-panel'], { small: isMobile }])}
      style={{
        '--color': primary,
      }}
    >
      {' '}
      {searchPanelText ? (
        <div>
          <h1 className={styles['autosuggest-searchpanel-text']}>
            {' '}
            {searchPanelText}
          </h1>
        </div>
      ) : null}
      <div className={styles['origin-input-container']}>
        <DTAutoSuggest
          appElement={appElement}
          icon="originEllipse"
          id="origin"
          autoFocus={
            disableAutoFocus === true ? false : !isMobile && !origin?.lat
          }
          refPoint={refPoint}
          className={getLocationType(origin)}
          placeholder={originPlaceHolder}
          value={value(origin)}
          searchContext={searchContext}
          getAutoSuggestIcons={getAutoSuggestIcons}
          onSelect={onSelect}
          onClear={onClear}
          focusChange={onFocusChange || handleFocusChange}
          lang={lang}
          sources={sources}
          targets={targets}
          filterResults={filterResults}
          isMobile={isMobile}
          colors={colors}
          mobileLabel={originMobileLabel}
          modeSet={modeSet}
          showScroll={showScroll}
          isEmbedded={isEmbedded}
        />
        {(showSwapControl || showViapointControl) && (
          <ItinerarySearchControl
            className={styles.opposite}
            enabled={showSwapControl}
            onClick={() => handleSwapOrderClick()}
            onKeyPress={e =>
              isKeyboardSelectionEvent(e) && handleSwapOrderClick()
            }
            aria-label={t('swap-order-button-label', { lng })}
          >
            <Icon img="opposite" color={primary} />
          </ItinerarySearchControl>
        )}
      </div>
      {viaPoints.length === 0 && (
        <div className={styles['rectangle-container']}>
          <div className={styles.rectangle} />
        </div>
      )}
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className={styles['viapoints-container']}>
          {viaPoints.map((o, i) => (
            <SortableViaPoint
              id={`viapoint-${i}`}
              index={i}
              disabled={viaPoints.length <= 1}
              className={styles['viapoint-container']}
              key={`viapoint-${i}`} // eslint-disable-line
            >
              {handleRef => (
                <>
                  <div className={styles['light-gray-background']}>
                    <div className={styles.row}>
                      <div
                        ref={handleRef}
                        className={styles['viapoint-before']}
                        style={viaPoints.length > 1 ? { cursor: 'move' } : {}}
                      >
                        {viaPoints.length > 1 && (
                          <Icon img="ellipsis" rotate={90} color={primary} />
                        )}
                      </div>
                      <div
                        className={cx(
                          `${styles['viapoint-input-container']} ${
                            styles[`viapoint-${i + 1}`]
                          }`,
                        )}
                      >
                        <DTAutoSuggest
                          appElement={appElement}
                          icon="mapMarker"
                          id="via-point"
                          ariaLabel={t('via-point-index', {
                            index: i + 1,
                            lng,
                          })}
                          autoFocus={
                            disableAutoFocus === true ? false : !isMobile
                          }
                          placeholder="via-point"
                          className="viapoint"
                          searchContext={searchContext}
                          refPoint={refPoint}
                          value={(o && o.address) || ''}
                          onSelect={onSelect}
                          onClear={onClear}
                          handleViaPoints={item =>
                            handleViaPointLocationSelected(item, i)
                          }
                          lang={lang}
                          sources={sources}
                          targets={targets}
                          filterResults={filterResults}
                          getAutoSuggestIcons={getAutoSuggestIcons}
                          isMobile={isMobile}
                          modeSet={modeSet}
                          colors={colors}
                          showScroll={showScroll}
                        />
                      </div>
                      {showSlackControl && (
                        <ItinerarySearchControl
                          className={styles['add-via-point-slack']}
                          enabled={showViapointControl}
                          onClick={() => handleToggleViaPointSlackClick(i)}
                          onKeyPress={e =>
                            isKeyboardSelectionEvent(e) &&
                            handleToggleViaPointSlackClick(i)
                          }
                          aria-label={t(
                            isViaPointSlackTimeInputActive(i)
                              ? 'add-via-duration-button-label-open'
                              : 'add-via-duration-button-label-close',
                            { index: i + 1, lng },
                          )}
                          wide
                        >
                          <Icon img="time" color={primary} />
                        </ItinerarySearchControl>
                      )}
                    </div>
                    {!isViaPointSlackTimeInputActive(i) &&
                      viaPoints[i] &&
                      viaPoints[i].locationSlack > 0 && (
                        <span className={styles['viapoint-slack-time']}>{`${t(
                          'viapoint-slack-amount',
                          {
                            lng,
                          },
                        )}: ${getSlackDisplay(
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
                          label={t('viapoint-slack-amount', { lng })}
                          options={slackTime}
                          value={getViaPointSlackTimeOrDefault(viaPoints[i])}
                          viaPointIndex={i}
                          icon={
                            <span
                              className={`${styles['combobox-icon']} ${styles['time-input-icon']}`}
                            >
                              <Icon img="time" color={primary} />
                            </span>
                          }
                          onSlackTimeSelected={handleViaPointSlackTimeSelected}
                        />
                      </div>
                    </div>
                  </div>
                  <ItinerarySearchControl
                    className={styles['remove-via-point']}
                    enabled={showViapointControl}
                    onClick={() => handleRemoveViaPointClick(i)}
                    onKeyPress={e =>
                      isKeyboardSelectionEvent(e) &&
                      handleRemoveViaPointClick(i)
                    }
                    aria-label={t('remove-via-button-label', {
                      index: i + 1,
                      lng,
                    })}
                  >
                    <Icon img="trash" color={primary} />
                  </ItinerarySearchControl>
                </>
              )}
            </SortableViaPoint>
          ))}
        </div>
      </DragDropProvider>
      <div className={styles['destination-input-container']}>
        <DTAutoSuggest
          appElement={appElement}
          icon="mapMarker"
          id="destination"
          autoFocus={
            disableAutoFocus === true
              ? false
              : !isMobile && !Number.isNaN(origin?.lat)
          }
          storeRef={storeDestinationRef}
          placeholder={destinationPlaceHolder}
          className={getLocationType(destination)}
          getAutoSuggestIcons={getAutoSuggestIcons}
          searchContext={searchContext}
          onSelect={onSelect}
          onClear={onClear}
          refPoint={refPoint}
          value={value(destination)}
          lang={lang}
          sources={sources}
          targets={targets}
          filterResults={filterResults}
          isMobile={isMobile}
          mobileLabel={destinationMobileLabel}
          modeSet={modeSet}
          colors={colors}
          showScroll={showScroll}
          isEmbedded={isEmbedded}
        />
        {(showSwapControl || showViapointControl) && (
          <ItinerarySearchControl
            className={cx(styles['add-via-point'], styles.more, {
              collapsed: viaPoints.length > 4,
            })}
            enabled={showViapointControl && viaPoints.length === 0}
            onClick={() => handleAddViaPointClick()}
            onKeyPress={e =>
              isKeyboardSelectionEvent(e) && handleAddViaPointClick()
            }
            aria-label={t('add-via-button-label', { lng })}
          >
            <Icon img="viapoint" width={1.25} height={1.375} color={primary} />
          </ItinerarySearchControl>
        )}
      </div>
    </div>
  );
}

DTAutosuggestPanel.propTypes = {
  appElement: PropTypes.string.isRequired,
  origin: locationShape,
  destination: locationShape,
  originPlaceHolder: PropTypes.string,
  destinationPlaceHolder: PropTypes.string,
  viaPoints: PropTypes.arrayOf(locationShape),
  updateViaPoints: PropTypes.func,
  handleViaPointLocationSelected: PropTypes.func,
  swapOrder: PropTypes.func,
  searchPanelText: PropTypes.string,
  searchContext: PropTypes.shape({
    URL_PELIAS: PropTypes.string,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  addAnalyticsEvent: PropTypes.func,
  lang: PropTypes.string.isRequired,
  disableAutoFocus: PropTypes.bool,
  sources: PropTypes.arrayOf(PropTypes.string),
  targets: PropTypes.arrayOf(PropTypes.string),
  filterResults: PropTypes.func,
  isMobile: PropTypes.bool,
  originMobileLabel: PropTypes.string,
  destinationMobileLabel: PropTypes.string,
  refPoint: locationShape,
  modeSet: PropTypes.string,
  colors: PropTypes.objectOf(PropTypes.string),
  getAutoSuggestIcons: PropTypes.objectOf(PropTypes.func),
  showScroll: PropTypes.bool,
  onFocusChange: PropTypes.func,
  isEmbedded: PropTypes.bool,
  showSwapControl: PropTypes.bool,
  showViapointControl: PropTypes.bool,
  showSlackControl: PropTypes.bool,
};
