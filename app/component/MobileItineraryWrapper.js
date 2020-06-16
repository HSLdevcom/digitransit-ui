import PropTypes from 'prop-types';
import React from 'react';
import Tabs from 'material-ui/Tabs/Tabs';
import Tab from 'material-ui/Tabs/Tab';
import { matchShape, routerShape } from 'found';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { FormattedMessage, intlShape } from 'react-intl';
import SwipeableViews from 'react-swipeable-views';
import Icon from './Icon';
import { isBrowser } from '../util/browser';
import { getRoutePath } from '../util/path';
import { addAnalyticsEvent } from '../util/analyticsUtils';

export default class MobileItineraryWrapper extends React.Component {
  static propTypes = {
    focus: PropTypes.func.isRequired,
    children: PropTypes.arrayOf(PropTypes.node.isRequired).isRequired,
    params: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      hash: PropTypes.string.isRequired,
    }).isRequired,
  };

  static contextTypes = {
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    intl: intlShape.isRequired,
  };

  itineraryTabs = [];

  getTabs(itineraries, selectedIndex) {
    return itineraries.map((itinerary, i) => (
      <Tab
        selected={i === selectedIndex}
        key={i} // eslint-disable-line react/no-array-index-key
        label="•"
        value={i}
        className={
          i === selectedIndex
            ? 'itinerary-tab-root--selected'
            : 'itinerary-tab-root'
        }
        style={{
          height: 'auto',
          color: i === selectedIndex ? '#007ac9' : '#ddd',
          fontSize: '34px',
          padding: '0px',
        }}
        aria-label={`${this.context.intl.formatMessage({
          id: 'itinerary-page.title',
          defaultMessage: 'Itinerary',
        })} ${i + 1}`}
      />
    ));
  }

  toggleFullscreenMap = () => {
    const fullscreenMap =
      this.context.match.location.state &&
      this.context.match.location.state.fullscreenMap === true;
    if (fullscreenMap) {
      this.context.router.go(-1);
    } else {
      this.context.router.push({
        ...this.context.match.location,
        state: { ...this.context.match.location.state, fullscreenMap: true },
      });
    }
    addAnalyticsEvent({
      action: fullscreenMap ? 'MinimizeMapOnMobile' : 'MaximizeMapOnMobile',
      category: 'Map',
      name: 'SummaryPage',
    });
  };

  focusMap = (lat, lon) => this.props.focus(lat, lon);

  switchSlide = index => {
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'Itinerary',
      action: 'OpenItineraryDetails',
      name: index,
    });

    this.context.router.replace({
      ...this.context.match,
      pathname: `${getRoutePath(
        this.props.params.from,
        this.props.params.to,
      )}/${index}`,
    });
    const itineraryTab = this.itineraryTabs[index];

    if (itineraryTab) {
      this.focusMap(
        itineraryTab.props.itinerary.legs[0].from.lat,
        itineraryTab.props.itinerary.legs[0].from.lon,
      );
    }
  };

  render() {
    const index = parseInt(this.props.params.hash, 10) || 0;

    if (!this.props.children) {
      return (
        <div className="itinerary-no-route-found">
          <FormattedMessage
            id="no-route-msg"
            defaultMessage="
              Unfortunately no route was found between the locations you gave.
              Please change origin and/or destination address.
            "
          />
        </div>
      );
    }

    const fullscreenMap =
      this.context.match.location.state &&
      this.context.match.location.state.fullscreenMap === true;

    const swipe = fullscreenMap ? (
      undefined
    ) : (
      <SwipeableViews
        index={index}
        key="swipe"
        className="itinerary-swipe-views-root"
        slideStyle={{ minHeight: '100%' }}
        containerStyle={{ minHeight: '100%' }}
        onChangeIndex={idx => setTimeout(this.switchSlide, 500, idx)}
      >
        {React.Children.map(this.props.children, (el, i) =>
          React.cloneElement(el, {
            focus: this.focusMap,
            ref: innerElement => {
              this.itineraryTabs[i] = innerElement;
            },
          }),
        )}
      </SwipeableViews>
    );
    const tabs = fullscreenMap ? (
      undefined
    ) : (
      <div className="itinerary-tabs-container" key="tabs">
        {isBrowser ? (
          <Tabs
            onChange={this.switchSlide}
            value={index}
            tabItemContainerStyle={{
              backgroundColor: '#eef1f3',
              lineHeight: '18px',
              width: '60px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
            inkBarStyle={{ display: 'none' }}
          >
            {this.getTabs(this.props.children, index)}
          </Tabs>
        ) : null}
      </div>
    );

    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
    return (
      <ReactCSSTransitionGroup
        transitionName="itinerary-container-content"
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}
        component="div"
        className={`itinerary-container-content ${
          fullscreenMap ? `minimized` : null
        }`}
        onTouchStart={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="fullscreen-toggle" onClick={this.toggleFullscreenMap}>
          {fullscreenMap ? (
            <Icon img="icon-icon_minimize" className="cursor-pointer" />
          ) : (
            <Icon img="icon-icon_maximize" className="cursor-pointer" />
          )}
        </div>
        {swipe}
        {tabs}
      </ReactCSSTransitionGroup>
    );
  }
}
