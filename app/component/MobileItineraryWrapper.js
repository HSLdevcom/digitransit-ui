import React from 'react';
import Tabs from 'material-ui/Tabs/Tabs';
import Tab from 'material-ui/Tabs/Tab';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { FormattedMessage } from 'react-intl';
import SwipeableViews from 'react-swipeable-views';

import { getRoutePath } from '../util/path';

export default class MobileItineraryWrapper extends React.Component {
  static propTypes = {
    fullscreenMap: React.PropTypes.bool,
    focus: React.PropTypes.func.isRequired,
    children: React.PropTypes.arrayOf(React.PropTypes.node.isRequired).isRequired,
    params: React.PropTypes.shape({
      from: React.PropTypes.string.isRequired,
      to: React.PropTypes.string.isRequired,
      hash: React.PropTypes.string.isRequired,
    }).isRequired,
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  };

  static getTabs(itineraries, selectedIndex) {
    return itineraries.map((itinerary, i) => (
      <Tab
        selected={i === selectedIndex}
        key={i} // eslint-disable-line react/no-array-index-key
        label="•"
        value={i}
        className={i === selectedIndex ? 'itinerary-tab-root--selected' : 'itinerary-tab-root'}
        style={{
          height: 'auto',
          color: i === selectedIndex ? '#007ac9' : '#ddd',
          fontSize: '34px',
          padding: '0px',
        }}
      />
    ));
  }

  state = {
    lat: undefined,
    lon: undefined,
  };

  toggleFullscreenMap = () => {
    if (this.props.fullscreenMap) {
      this.context.router.goBack();
    } else {
      this.context.router.push({
        ...this.context.location,
        pathname: `${this.context.location.pathname}/kartta`,
      });
    }
  };

  focusMap = (lat, lon) => this.props.focus(lat, lon)

  switchSlide = (index) => {
    this.context.router.replace({
      ...this.context.location,
      pathname: `${getRoutePath(this.props.params.from, this.props.params.to)}/${index}`,
    });
    const itineraryTab = this.refs[`itineraryTab${index}`];

    if (itineraryTab) {
      const coords = itineraryTab.refs.component.getState();
      this.focusMap(coords.lat, coords.lon);
    }
  }

  render() {
    const index = parseInt(this.props.params.hash, 10) || 0;

    if (!this.props.children) {
      return (
        <div className="itinerary-no-route-found">
          <FormattedMessage
            id="no-route-msg"
            defaultMessage={`
              Unfortunately no route was found between the locations you gave.
              Please change origin and/or destination address.
            `}
          />
        </div>
      );
    }

    const swipe = this.props.fullscreenMap ? undefined : (
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
            ref: `itineraryTab${i}`,
          }),
        )}
      </SwipeableViews>);
    const tabs = this.props.fullscreenMap ? undefined : (
      <div className="itinerary-tabs-container" key="tabs">
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
          {MobileItineraryWrapper.getTabs(this.props.children, index)}
        </Tabs>
      </div>);

    return (
      <ReactCSSTransitionGroup
        transitionName="itinerary-container-content"
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}
        component="div"
        className="itinerary-container-content"
        onTouchStart={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        {swipe}
        {tabs}
      </ReactCSSTransitionGroup>
    );
  }
}
